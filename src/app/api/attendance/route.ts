import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Function to format time to show only time (HH:MM AM/PM)
function formatTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return time;
  } catch (error) {
    return dateTimeString;
  }
}

// Function to format date properly
function formatDate(dateValue: any): string {
  try {
    if (!dateValue) return '';
    
    // If it's already a string in YYYY-MM-DD format, return it
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's a Date object or timestamp, convert it
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const department = searchParams.get('dept');
    const shift = searchParams.get('shift');
    const searchQuery = searchParams.get('q');

    // Build the JOIN query with filters
    let baseQuery = `
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
    `;
    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    // Date range filter
    if (startDate && endDate) {
      whereConditions.push(`t.date >= $${paramIndex} AND t.date <= $${paramIndex + 1}`);
      values.push(startDate, endDate);
      paramIndex += 2;
    } else if (startDate) {
      whereConditions.push(`t.date >= $${paramIndex}`);
      values.push(startDate);
      paramIndex += 1;
    } else if (endDate) {
      whereConditions.push(`t.date <= $${paramIndex}`);
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
    
    // Format the data
    const enrichedData = result.rows.map((row: any) => {
      return {
        id: row.id,
        date: formatDate(row.date),
        time: formatTime(row.time),
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
