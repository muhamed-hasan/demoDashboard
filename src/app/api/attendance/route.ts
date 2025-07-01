import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper function to fix date parsing issues
function fixDateString(dateString: string): Date {
  try {
    // Log the original date string for debugging
    console.log('Original date string:', dateString);
    
    let date = new Date(dateString);
    
    // Log the parsed date for debugging
    console.log('Parsed date:', date, 'Year:', date.getFullYear());
    
    // Check if the year is wrong (like 2001) and fix it
    if (date.getFullYear() < 2020) {
      console.log('Year is wrong, attempting to fix...');
      
      // Try different parsing approaches
      if (typeof dateString === 'string') {
        // Approach 1: If it contains space, split date and time
        if (dateString.includes(' ')) {
          const parts = dateString.split(' ');
          if (parts.length >= 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            
            console.log('Date part:', datePart, 'Time part:', timePart);
            
            // Try to parse date part (assuming format like "2025-01-15")
            const dateParts = datePart.split('-');
            if (dateParts.length === 3) {
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
              const day = parseInt(dateParts[2]);
              
              console.log('Parsed parts - Year:', year, 'Month:', month, 'Day:', day);
              
              // If year is wrong, use 2025
              const correctYear = year < 2020 ? 2025 : year;
              date = new Date(correctYear, month, day);
              
              console.log('Fixed date:', date, 'Correct year:', correctYear);
              
              // Add time if available
              if (timePart) {
                const timeParts = timePart.split(':');
                if (timeParts.length >= 2) {
                  const hours = parseInt(timeParts[0]);
                  const minutes = parseInt(timeParts[1]);
                  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
                  date.setHours(hours, minutes, seconds);
                  console.log('Added time - Hours:', hours, 'Minutes:', minutes, 'Seconds:', seconds);
                }
              }
            }
          }
        } else {
          // Approach 2: If it's just a date string, try to extract year and fix
          const dateParts = dateString.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            
            if (year < 2020) {
              const correctYear = 2025;
              date = new Date(correctYear, month, day);
              console.log('Fixed date from date-only string:', date);
            }
          }
        }
      }
    }
    
    console.log('Final date:', date);
    return date;
  } catch (error) {
    console.error('Error fixing date string:', dateString, error);
    return new Date(dateString);
  }
}

// Function to format time to show only day and time
function formatTime(dateTimeString: string): string {
  try {
    console.log('formatTime input:', dateTimeString);
    
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
    
    const result = `${day} ${time}`;
    console.log('formatTime output:', result);
    return result;
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
      
      console.log('Processed time string:', timeString);
      console.log('Processed date string:', dateString);
      
      return {
        id: row.id,
        date: dateString || new Date(timeString as string).toISOString().split('T')[0],
        time: formatTime(timeString as string),
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
