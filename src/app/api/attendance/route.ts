import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper function to fix date parsing issues
function fixDateString(dateString: string): Date {
  try {
    let date = new Date(dateString);
    
    // If the year is wrong (like 2001), try to fix it
    if (date.getFullYear() < 2020 && typeof dateString === 'string' && dateString.includes(' ')) {
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        
        const dateParts = datePart.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
          const day = parseInt(dateParts[2]);
          
          // If year is wrong, use current year or 2025
          const correctYear = year < 2020 ? 2025 : year;
          date = new Date(correctYear, month, day);
          
          // Add time if available
          if (timePart) {
            const timeParts = timePart.split(':');
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1]);
              const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
              date.setHours(hours, minutes, seconds);
            }
          }
        }
      }
    }
    
    return date;
  } catch (error) {
    console.error('Error fixing date string:', dateString, error);
    return new Date(dateString);
  }
}

// Function to format time to show only day and time
function formatTime(dateTimeString: string): string {
  try {
    const date = fixDateString(dateTimeString);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateTimeString);
      return dateTimeString;
    }
    
    const day = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${day} ${time}`;
  } catch (error) {
    console.error('Error formatting time:', dateTimeString, error);
    return dateTimeString;
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
    
    // Format the data
    const enrichedData = result.rows.map((row: Record<string, unknown>) => {
      return {
        id: row.id,
        date: row.date || new Date(row.time as string).toISOString().split('T')[0],
        time: formatTime(row.time as string),
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
