import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface Employee {
  'First Name': string;
  'Last Name': string;
  Department: string;
  Shift: string;
}

interface AttendanceRecord {
  date: string;
  id: string;
  login: string | null;
  logout: string | null;
  totalHours: number;
  status: 'Present' | 'Late' | 'Absent';
}

export interface AttendanceDetailData {
  date: string;
  id: string;
  name: string;
  department: string;
  shift: string;
  login: string | null;
  logout: string | null;
  hours: number;
  status: 'Present' | 'Late' | 'Absent' | 'Early Leave' | 'Partial Day';
}

// Function to calculate hours between two times
function calculateHours(loginTime: string, logoutTime: string): number {
  try {
    const login = new Date(`2000-01-01T${loginTime}`);
    const logout = new Date(`2000-01-01T${logoutTime}`);
    
    // If logout is before login, it means logout is next day
    if (logout < login) {
      logout.setDate(logout.getDate() + 1);
    }
    
    const diffMs = logout.getTime() - login.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100;
  } catch (error) {
    return 0;
  }
}

// Function to format time to HH:MM
function formatTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    return dateTimeString;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departments = searchParams.getAll('department');
    const shift = searchParams.get('shift');
    const search = searchParams.get('search');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Load employee data from JSON file
    const jsonFilePath = path.join(process.cwd(), 'public', 'data.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employees: Record<string, Employee> = JSON.parse(jsonData);

    // Query to get first login and last logout for each employee on the specified date
    const query = `
      SELECT 
        id,
        DATE(time) as date,
        MIN(CASE WHEN time::time < '12:00:00' THEN time END) as first_login,
        MAX(CASE WHEN time::time >= '12:00:00' THEN time END) as last_logout
      FROM table3 
      WHERE DATE(time) = $1
      GROUP BY id, DATE(time)
      ORDER BY id
    `;

    const result = await pool.query(query, [startDate]);
    
    // Transform the data
    let detailedAttendance: AttendanceDetailData[] = result.rows.map((row: any) => {
      const employee = employees[row.id];
      const fullName = employee 
        ? `${employee['First Name']} ${employee['Last Name']}`
        : `Employee ${row.id}`;

      const login = row.first_login ? formatTime(row.first_login) : null;
      const logout = row.last_logout ? formatTime(row.last_logout) : null;
      const hours = login && logout ? calculateHours(login, logout) : 0;

      // Determine status based on hours
      let status: AttendanceDetailData['status'] = 'Absent';
      if (login && logout) {
        if (hours >= 8) {
          status = 'Present';
        } else if (hours >= 6) {
          status = 'Partial Day';
        } else if (hours > 0) {
          status = 'Early Leave';
        }
      } else if (login && !logout) {
        status = 'Present'; // Only login, no logout
      }

      return {
        date: row.date,
        id: row.id,
        name: fullName,
        department: employee?.Department || 'Unknown',
        shift: employee?.Shift || 'Day',
        login: login,
        logout: logout,
        hours: hours,
        status: status,
      };
    });

    // Apply filters
    if (departments.length > 0) {
      detailedAttendance = detailedAttendance.filter(
        record => departments.includes(record.department)
      );
    }

    if (shift && shift !== 'all') {
      detailedAttendance = detailedAttendance.filter(
        record => {
          const recordShift = record.shift || 'Day';
          return recordShift.toLowerCase() === shift.toLowerCase();
        }
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      detailedAttendance = detailedAttendance.filter(
        record => 
          record.name.toLowerCase().includes(searchLower) ||
          record.id.includes(searchLower) ||
          record.department.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    detailedAttendance.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(detailedAttendance);
  } catch (error) {
    console.error('Error fetching detailed attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}
