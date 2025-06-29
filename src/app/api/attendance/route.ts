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

// Function to format time to show only day and time
function formatTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
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

    // Load employee data from JSON file
    const jsonFilePath = path.join(process.cwd(), 'public', 'data.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData: EmployeeRecord = JSON.parse(jsonData);

    // Build SQL query with filters
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

    query += ' ORDER BY time DESC';
    
    const result = await pool.query(query, values);
    
    // Enrich database records with employee information and apply filters
    let enrichedData = result.rows.map((row: any) => {
      const employeeId = row.id?.toString() || '';
      const employee = employeeData[employeeId];
      
      return {
        id: row.id,
        date: row.date,
        time: formatTime(row.time),
        fullName: employee ? `${employee['First Name']} ${employee['Last Name']}`.trim() : '',
        firstName: employee?.['First Name'] || '',
        lastName: employee?.['Last Name'] || '',
        shift: employee?.['Shift'] || '',
        department: employee?.['Department'] || '',
      };
    });

    // Apply client-side filters for department, shift, and search query
    if (department) {
      enrichedData = enrichedData.filter(record => 
        record.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (shift) {
      enrichedData = enrichedData.filter(record => 
        record.shift.toLowerCase().includes(shift.toLowerCase())
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      enrichedData = enrichedData.filter(record => 
        record.fullName.toLowerCase().includes(query) ||
        record.firstName.toLowerCase().includes(query) ||
        record.lastName.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.shift.toLowerCase().includes(query)
      );
    }
    
    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}
