import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== DEBUG TABLE DATA ===');
    
    // Get the same data that the attendance API returns
    const result = await pool.query(`
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
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
      ORDER BY t.time DESC
      LIMIT 10
    `);

    console.log('Raw database result:', JSON.stringify(result.rows, null, 2));

    // Format the data exactly like the attendance API does
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
      
      // Use the date field if available, otherwise extract date from time
      let displayDate = dateString;
      if (!displayDate && timeString) {
        try {
          const timeDate = new Date(timeString as string);
          if (!isNaN(timeDate.getTime())) {
            displayDate = timeDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error extracting date from time:', error);
        }
      }
      
      const formattedItem = {
        id: row.id,
        date: displayDate,
        time: timeString,
        fullName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}`.trim() : row.name || '',
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        shift: row.shift || '',
        department: row.department || row.group || '',
        // Additional fields from table3
        time2: row.time2,
        rname: row.rname,
        card_number: row.card_number,
        dev: row.dev
      };
      
      console.log('Formatted item:', JSON.stringify(formattedItem, null, 2));
      
      return formattedItem;
    });

    // Transform data for AttendanceTable component (like in page.tsx)
    const attendanceData = enrichedData.map((item: Record<string, unknown>) => ({
      id: item.id,
      date: item.date || item.time, // Use date field if available, otherwise use time
      name: item.fullName,
      department: item.department,
      shift: item.shift,
      login: item.time,
    }));

    console.log('Final attendance data for table:', JSON.stringify(attendanceData, null, 2));

    return NextResponse.json({
      success: true,
      raw_database_data: result.rows,
      enriched_data: enrichedData,
      attendance_table_data: attendanceData,
      message: 'Debug table data completed successfully'
    });

  } catch (error) {
    console.error('Error in debug table API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to debug table data' },
      { status: 500 }
    );
  }
} 