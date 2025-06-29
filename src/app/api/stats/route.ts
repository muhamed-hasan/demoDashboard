import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface EmployeeData {
  'First Name': string;
  'Last Name': string;
  'Department': string;
  'Shift': string;
}

interface EmployeeRecord {
  [key: string]: EmployeeData;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Load employee data from JSON file
    const jsonFilePath = path.join(process.cwd(), 'public', 'data.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData: EmployeeRecord = JSON.parse(jsonData);

    // Build SQL query with date filters
    let query = 'SELECT * FROM table3';
    const values: string[] = [];
    const conditions: string[] = [];

    // Date range filter
    if (startDate && endDate) {
      conditions.push('date >= $' + (values.length + 1) + ' AND date <= $' + (values.length + 2));
      values.push(startDate, endDate);
    } else if (startDate) {
      conditions.push('date >= $' + (values.length + 1));
      values.push(startDate);
    } else if (endDate) {
      conditions.push('date <= $' + (values.length + 1));
      values.push(endDate);
    }

    // Apply WHERE clause if we have conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);

    // Get all unique employee IDs from the data
    const totalEmployees = Object.keys(employeeData).length;
    
    // Get unique employee IDs from attendance records (present employees)
    const presentEmployeeIds = new Set(result.rows.map((row: any) => row.id?.toString()));
    const presentCount = presentEmployeeIds.size;
    const absentCount = totalEmployees - presentCount;
    const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(2) : '0.00';

    // Calculate department distribution
    const deptDistribution: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      const employeeId = row.id?.toString() || '';
      const employee = employeeData[employeeId];
      if (employee?.Department) {
        const dept = employee.Department;
        deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
      }
    });

    // Calculate shift distribution
    const shiftDistribution: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      const employeeId = row.id?.toString() || '';
      const employee = employeeData[employeeId];
      if (employee?.Shift) {
        const shift = employee.Shift;
        // Normalize shift names
        const normalizedShift = shift.toLowerCase() === 'day' ? 'Day' : 
                               shift.toLowerCase() === 'night' ? 'Night' : 
                               shift || 'Unknown';
        shiftDistribution[normalizedShift] = (shiftDistribution[normalizedShift] || 0) + 1;
      } else {
        shiftDistribution['Unknown'] = (shiftDistribution['Unknown'] || 0) + 1;
      }
    });

    const stats = {
      totalEmployees,
      presentCount,
      absentCount,
      attendanceRate: parseFloat(attendanceRate),
      deptDistribution,
      shiftDistribution
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance statistics' }, { status: 500 });
  }
}
