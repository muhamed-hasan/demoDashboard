import { NextRequest, NextResponse } from 'next/server';
import { getMockAttendanceData } from '../../../../lib/mockAttendance';
import employeeData from '../../../../public/data.json';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departments = searchParams.getAll('department');
    const shift = searchParams.get('shift');
    const search = searchParams.get('search');

    // Get raw attendance data
    const attendanceRecords = getMockAttendanceData();
    const employees = employeeData as Record<string, Employee>;

    // Transform the data to match our table interface
    let detailedAttendance: AttendanceDetailData[] = attendanceRecords.map((record: AttendanceRecord) => {
      const employee = employees[record.id];
      const fullName = employee 
        ? `${employee['First Name']} ${employee['Last Name']}`
        : `Employee ${record.id}`;

      // Map status to include additional statuses
      let status: AttendanceDetailData['status'] = record.status;
      
      // Add logic for Early Leave and Partial Day if needed
      if (record.status === 'Present' && record.totalHours > 0 && record.totalHours < 6) {
        status = 'Partial Day';
      } else if (record.status === 'Present' && record.totalHours > 0 && record.totalHours < 8 && record.logout) {
        status = 'Early Leave';
      }

      return {
        date: record.date,
        id: record.id,
        name: fullName,
        department: employee?.Department || 'Unknown',
        shift: employee?.Shift || 'Day',
        login: record.login,
        logout: record.logout,
        hours: record.totalHours,
        status: status,
      };
    });

    // Apply filters
    if (startDate) {
      detailedAttendance = detailedAttendance.filter(
        record => new Date(record.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      detailedAttendance = detailedAttendance.filter(
        record => new Date(record.date) <= new Date(endDate)
      );
    }

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

    // Sort by date (newest first) and then by name
    detailedAttendance.sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(detailedAttendance);
  } catch (error) {
    console.error('Error fetching detailed attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}
