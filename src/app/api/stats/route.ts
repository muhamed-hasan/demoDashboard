import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const departments = searchParams.getAll('department');
    const shift = searchParams.get('shift');
    const searchText = searchParams.get('search');

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
    if (departments.length > 0) {
      whereConditions.push(`d.department = $${paramIndex}`);
      values.push(departments[0]); // Take only the first department
      paramIndex += 1;
    }

    // Shift filter
    if (shift && shift !== 'all') {
      whereConditions.push(`LOWER(d.shift) = LOWER($${paramIndex})`);
      values.push(shift);
      paramIndex += 1;
    }

    // Search filter
    if (searchText) {
      whereConditions.push(`
        (LOWER(d.first_name || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(d.last_name || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(CONCAT(d.first_name, ' ', d.last_name)) LIKE LOWER($${paramIndex}) OR
         LOWER(d.department || '') LIKE LOWER($${paramIndex}) OR 
         LOWER(d.shift || '') LIKE LOWER($${paramIndex}))
      `);
      values.push(`%${searchText}%`);
      paramIndex += 1;
    }

    // Build the WHERE clause
    let whereClause = '';
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    // Get total employees count
    let totalEmployeesQuery = 'SELECT COUNT(*) FROM details';
    let totalEmployeesValues: any[] = [];
    let totalEmployeesConditions: string[] = [];

    // Apply same filters to total employees count
    if (departments.length > 0) {
      totalEmployeesConditions.push(`department = $${totalEmployeesValues.length + 1}`);
      totalEmployeesValues.push(departments[0]); // Take only the first department
    }

    if (shift && shift !== 'all') {
      totalEmployeesConditions.push(`LOWER(shift) = LOWER($${totalEmployeesValues.length + 1})`);
      totalEmployeesValues.push(shift);
    }

    if (searchText) {
      totalEmployeesConditions.push(`
        (LOWER(first_name || '') LIKE LOWER($${totalEmployeesValues.length + 1}) OR 
         LOWER(last_name || '') LIKE LOWER($${totalEmployeesValues.length + 1}) OR 
         LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER($${totalEmployeesValues.length + 1}) OR
         LOWER(department || '') LIKE LOWER($${totalEmployeesValues.length + 1}) OR 
         LOWER(shift || '') LIKE LOWER($${totalEmployeesValues.length + 1}))
      `);
      totalEmployeesValues.push(`%${searchText}%`);
    }

    if (totalEmployeesConditions.length > 0) {
      totalEmployeesQuery += ' WHERE ' + totalEmployeesConditions.join(' AND ');
    }

    const totalEmployeesResult = await pool.query(totalEmployeesQuery, totalEmployeesValues);
    const totalEmployees = parseInt(totalEmployeesResult.rows[0].count);

    // Get attendance data with JOIN
    const attendanceQuery = `
      SELECT DISTINCT t.id, d.department, d.shift
      ${baseQuery} 
      ${whereClause}
    `;
    
    const result = await pool.query(attendanceQuery, values);
    
    // Get unique employee IDs from filtered attendance records (present employees)
    const presentEmployeeIds = new Set(result.rows.map((row: any) => row.id?.toString()));
    const presentCount = presentEmployeeIds.size;
    const absentCount = totalEmployees - presentCount;
    const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(2) : '0.00';

    // Calculate department distribution from filtered data
    const deptDistribution: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      if (row.department) {
        const dept = row.department;
        deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
      }
    });

    // Calculate shift distribution from filtered data
    const shiftDistribution: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      if (row.shift) {
        const shift = row.shift;
        // Normalize shift names
        const normalizedShift = shift.toLowerCase() === 'day' ? 'Day' : 
                               shift.toLowerCase() === 'night' ? 'Night' : 
                               shift || 'Unknown';
        shiftDistribution[normalizedShift] = (shiftDistribution[normalizedShift] || 0) + 1;
      } else {
        shiftDistribution['Unknown'] = (shiftDistribution['Unknown'] || 0) + 1;
      }
    });

    // Calculate Heidelberg department stats
    const heidelbergQuery = `
      SELECT COUNT(*) as total_employees
      FROM details 
      WHERE department = 'Heidelberg'
    `;
    const heidelbergTotalResult = await pool.query(heidelbergQuery);
    const heidelbergTotalEmployees = parseInt(heidelbergTotalResult.rows[0].total_employees);

    const heidelbergAttendanceQuery = `
      SELECT DISTINCT t.id
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
      WHERE d.department = 'Heidelberg'
      ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
    `;
    const heidelbergAttendanceResult = await pool.query(heidelbergAttendanceQuery, values);
    const heidelbergPresentCount = heidelbergAttendanceResult.rows.length;
    const heidelbergAbsentCount = heidelbergTotalEmployees - heidelbergPresentCount;

    // Calculate Naser department stats
    const naserQuery = `
      SELECT COUNT(*) as total_employees
      FROM details 
      WHERE department = 'Naser'
    `;
    const naserTotalResult = await pool.query(naserQuery);
    const naserTotalEmployees = parseInt(naserTotalResult.rows[0].total_employees);

    const naserAttendanceQuery = `
      SELECT DISTINCT t.id
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
      WHERE d.department = 'Naser'
      ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
    `;
    const naserAttendanceResult = await pool.query(naserAttendanceQuery, values);
    const naserPresentCount = naserAttendanceResult.rows.length;
    const naserAbsentCount = naserTotalEmployees - naserPresentCount;

    const stats = {
      totalEmployees,
      presentCount,
      absentCount,
      attendanceRate: parseFloat(attendanceRate),
      deptDistribution,
      shiftDistribution,
      heidelbergStats: {
        totalEmployees: heidelbergTotalEmployees,
        presentCount: heidelbergPresentCount,
        absentCount: heidelbergAbsentCount
      },
      naserStats: {
        totalEmployees: naserTotalEmployees,
        presentCount: naserPresentCount,
        absentCount: naserAbsentCount
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance statistics' }, { status: 500 });
  }
}
