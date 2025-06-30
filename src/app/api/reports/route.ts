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
        a.date,
        a.login_time,
        a.logout_time,
        a.hours_worked,
        a.status
      FROM details d
      LEFT JOIN attendance a ON d.id = a.employee_id
    `;

    const params: any[] = [];
    let whereConditions: string[] = [];

    if (startDate && endDate) {
      whereConditions.push(`a.date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
      params.push(startDate, endDate);
    } else if (startDate) {
      whereConditions.push(`a.date = $${params.length + 1}`);
      params.push(startDate);
    }

    if (department && department !== 'All') {
      whereConditions.push(`d.department = $${params.length + 1}`);
      params.push(department);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.date DESC, d.id`;

    const result = await pool.query(query, params);

    // Transform the data to match the expected format
    const transformedData = result.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      department: row.department,
      shift: row.shift || '',
      date: row.date,
      login: row.login_time,
      logout: row.logout_time,
      hours: row.hours_worked || 0,
      status: row.status || 'Absent'
    }));

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