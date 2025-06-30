import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Function to format time to show only time (HH:MM)
function formatTimeOnly(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    return timeString;
  }
}

// Function to calculate hours between two times
function calculateHours(startTime: string, endTime: string): number {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Query to get aggregated attendance data for each employee per day
    const query = `
      SELECT 
        t.id,
        d.first_name,
        d.last_name,
        d.department,
        d.shift,
        t.date,
        MIN(t.time) as first_login,
        MAX(t.time) as last_logout,
        COUNT(*) as total_records
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
      WHERE t.date >= $1 AND t.date <= $2
      GROUP BY t.id, d.first_name, d.last_name, d.department, d.shift, t.date
      ORDER BY t.date DESC, t.id
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    
    // Format the data
    const reportsData = result.rows.map((row: any) => {
      const hours = calculateHours(row.first_login, row.last_logout);
      
      // Use the date directly from database (it's already a date type)
      const formattedDate = row.date || '';
      
      return {
        id: row.id,
        fullName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}`.trim() : 'غير محدد',
        department: row.department || 'غير محدد',
        shift: row.shift || 'غير محدد',
        date: formattedDate,
        firstLogin: formatTimeOnly(row.first_login),
        lastLogout: formatTimeOnly(row.last_logout),
        hours: hours,
        totalRecords: row.total_records
      };
    });
    
    return NextResponse.json(reportsData);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return NextResponse.json({ error: 'Failed to fetch reports data' }, { status: 500 });
  }
} 