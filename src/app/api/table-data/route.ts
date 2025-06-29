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
    return dateTimeString; // Return original if parsing fails
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch data from database
    let query = 'SELECT * FROM table3';
    const values: string[] = [];

    if (startDate && endDate) {
      query += ' WHERE date >= $1 AND date <= $2';
      values.push(startDate, endDate);
    }

    query += ' ORDER BY time DESC';
    const result = await pool.query(query, values);
    
    // Load employee data from JSON file
    const jsonFilePath = path.join(process.cwd(), 'public', 'data.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData: EmployeeRecord = JSON.parse(jsonData);
    
    // Enrich database records with employee information
    const enrichedData = result.rows.map((row: any) => {
      const employeeId = row.id?.toString() || '';
      const employee = employeeData[employeeId];
      
      return {
        id: row.id,
        time: formatTime(row.time), // Format time to show day and time only
        fullName: employee ? `${employee['First Name']} ${employee['Last Name']}`.trim() : '',
        shift: employee?.['Shift'] || '',
        department: employee?.['Department'] || '',
      };
    });
    
    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
