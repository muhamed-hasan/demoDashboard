import { NextResponse } from 'next/server';
import pool from '@/lib/db';





export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const department = searchParams.get('dept');
    const shift = searchParams.get('shift');
    const searchQuery = searchParams.get('q');

    // Build the JOIN query with filters
    const baseQuery = `
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
    `;
    const whereConditions: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    // Date range filter
    if (startDate && endDate) {
      whereConditions.push(`DATE(t.time) >= $${paramIndex} AND DATE(t.time) <= $${paramIndex + 1}`);
      values.push(startDate, endDate);
      paramIndex += 2;
    } else if (startDate) {
      whereConditions.push(`DATE(t.time) >= $${paramIndex}`);
      values.push(startDate);
      paramIndex += 1;
    } else if (endDate) {
      whereConditions.push(`DATE(t.time) <= $${paramIndex}`);
      values.push(endDate);
      paramIndex += 1;
    }

    // Department filter
    if (department) {
      whereConditions.push(`LOWER(d.department || '') LIKE LOWER($${paramIndex})`);
      values.push(`%${department}%`);
      paramIndex += 1;
    }

    // Shift filter
    if (shift) {
      whereConditions.push(`LOWER(d.shift || '') LIKE LOWER($${paramIndex})`);
      values.push(`%${shift}%`);
      paramIndex += 1;
    }

    // Search filter
    if (searchQuery) {
      whereConditions.push(`
        (LOWER(d.first_name || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(d.last_name || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(CONCAT(d.first_name, ' ', d.last_name)) LIKE LOWER($${paramIndex}) OR
         LOWER(d.department || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(d.shift || '') LIKE LOWER($${paramIndex}))
      `);
      values.push(`%${searchQuery}%`);
      paramIndex += 1;
    }

    // Build the WHERE clause
    let whereClause = '';
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    // Get data with JOIN
    const query = `
      SELECT 
        t.id,
        t.time,
        t.date,
        t.time2,
        t.fname,
        t.lname,
        t.name,
        t.rname,
        t.group,
        t.card_number,
        t.pic,
        t.dev,
        d.first_name,
        d.last_name,
        d.department,
        d.shift
      ${baseQuery} 
      ${whereClause} 
      ORDER BY t.time DESC
    `;
    
    const result = await pool.query(query, values);
    
    // Log the raw data from database for debugging
    console.log('Raw data from database:', result.rows.slice(0, 3)); // Log first 3 rows
    
    // Log the data types
    if (result.rows.length > 0) {
      const firstRow = result.rows[0];
      console.log('Data types - time:', typeof firstRow.time, 'date:', typeof firstRow.date);
      console.log('Time value:', firstRow.time);
      console.log('Date value:', firstRow.date);
    }
    
    // Format the data
    const enrichedData = result.rows.map((row: Record<string, unknown>) => {
      // Log each row's time field for debugging
      console.log('Processing row - ID:', row.id, 'Time:', row.time, 'Date:', row.date);
      
      // Check if the time field is a Date object or string
      let timeString = row.time;
      if (timeString instanceof Date) {
        timeString = timeString.toISOString();
      }
      
      // Check if the date field is a Date object or string
      let dateString = row.date;
      if (dateString instanceof Date) {
        dateString = dateString.toISOString().split('T')[0];
      }
      
      // إذا لم يوجد dateString استخدم التاريخ من timeString
      if (!dateString && timeString) {
        try {
          const timeDate = new Date(timeString as string);
          if (!isNaN(timeDate.getTime())) {
            dateString = timeDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error extracting date from time:', error);
        }
      }
      
      return {
        id: row.id,
        date: dateString, // التاريخ الخام فقط
        time: timeString, // الوقت الخام فقط
        fullName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}`.trim() : row.name || '',
        firstName: row.first_name || row.fname || '',
        lastName: row.last_name || row.lname || '',
        shift: row.shift || '',
        department: row.department || row.group || '',
        // Additional fields from table3
        time2: row.time2,
        rname: row.rname,
        card_number: row.card_number,
        dev: row.dev
      };
    });
    
    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}
