import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');

    let query = `
      SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.department,
        d.shift,
        t.date,
        t.time as login_time,
        t.time2 as logout_time,
        t.dev,
        t.rname
      FROM details d
      LEFT JOIN table3 t ON d.id::text = t.id
    `;

    const params: any[] = [];
    let whereConditions: string[] = [];

    if (startDate && endDate) {
      whereConditions.push(`DATE(t.time) BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(startDate, endDate);
    } else if (startDate) {
      whereConditions.push(`DATE(t.time) = $${params.length + 1}`);
      params.push(startDate);
    }

    if (department && department !== 'All') {
      whereConditions.push(`d.department = $${params.length + 1}`);
      params.push(department);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY t.time DESC, d.id`;

    console.log('Reports Query:', query);
    console.log('Reports Params:', params);

    const result = await pool.query(query, params);

    console.log('Reports Result:', {
      rowCount: result.rows.length,
      firstRow: result.rows[0],
      lastRow: result.rows[result.rows.length - 1]
    });

    // Transform the data to match the expected format
    const transformedData = result.rows.map(row => {
      // Calculate hours worked if we have both login and logout times
      let hours = 0;
      let status = 'Present';
      
      if (row.login_time && row.logout_time) {
        try {
          const loginTime = new Date(row.login_time);
          const logoutTime = new Date(row.logout_time);
          if (!isNaN(loginTime.getTime()) && !isNaN(logoutTime.getTime())) {
            hours = (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60 * 60); // Convert to hours
          }
        } catch (error) {
          console.error('Error calculating hours:', error);
        }
      } else if (!row.login_time) {
        status = 'Absent';
      }

      return {
        id: row.id,
        name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown',
        department: row.department || '',
        shift: row.shift || '',
        date: row.date,
        login: row.login_time,
        logout: row.logout_time,
        hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
        status: status
      };
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء جلب البيانات',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 