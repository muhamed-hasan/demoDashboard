import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Helper function to fix date parsing issues
function fixDateString(dateString: string): Date {
  try {
    let date = new Date(dateString);
    
    // If the year is wrong (like 2001), try to fix it
    if (date.getFullYear() < 2020 && typeof dateString === 'string' && dateString.includes(' ')) {
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        
        const dateParts = datePart.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
          const day = parseInt(dateParts[2]);
          
          // If year is wrong, use current year or 2025
          const correctYear = year < 2020 ? 2025 : year;
          date = new Date(correctYear, month, day);
          
          // Add time if available
          if (timePart) {
            const timeParts = timePart.split(':');
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1]);
              const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
              date.setHours(hours, minutes, seconds);
            }
          }
        }
      }
    }
    
    return date;
  } catch (error) {
    console.error('Error fixing date string:', dateString, error);
    return new Date(dateString);
  }
}

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

    const params: (string | number)[] = [];
    const whereConditions: string[] = [];

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

    const result = await pool.query(query, params);

    // Transform the data to match the expected format
    const transformedData = result.rows.map(row => {
      // Format date properly
      let formattedDate = row.date;
      if (row.date) {
        try {
          const dateObj = new Date(row.date);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0]; // Get only the date part
          }
        } catch (error) {
          console.error('Error formatting date:', row.date, error);
        }
      }
      
      // Calculate hours worked if we have both login and logout times
      let hours = 0;
      let status = 'Present';
      
      if (row.login_time && row.logout_time) {
        try {
          const loginTime = fixDateString(row.login_time);
          const logoutTime = fixDateString(row.logout_time);
          
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
        date: formattedDate,
        login: row.login_time,
        logout: row.logout_time,
        hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
        status: status
      };
    });

    // Group by employee ID and date to get first and last records
    const groupedData = new Map();
    
    transformedData.forEach(record => {
      const key = `${record.id}-${record.date}`;
      
      if (!groupedData.has(key)) {
        // First record for this employee on this date
        groupedData.set(key, {
          ...record,
          firstLogin: record.login,
          lastLogout: record.logout,
          totalHours: record.hours
        });
      } else {
        // Update existing record with earliest login and latest logout
        const existing = groupedData.get(key);
        
        if (record.login && (!existing.firstLogin || (() => {
          try {
            const loginTime = fixDateString(record.login);
            const existingLoginTime = fixDateString(existing.firstLogin);
            return !isNaN(loginTime.getTime()) && !isNaN(existingLoginTime.getTime()) && loginTime < existingLoginTime;
          } catch (error) {
            console.error('Error comparing login times:', error);
            return false;
          }
        })())) {
          existing.firstLogin = record.login;
        }
        
        if (record.logout && (!existing.lastLogout || (() => {
          try {
            const logoutTime = fixDateString(record.logout);
            const existingLogoutTime = fixDateString(existing.lastLogout);
            return !isNaN(logoutTime.getTime()) && !isNaN(existingLogoutTime.getTime()) && logoutTime > existingLogoutTime;
          } catch (error) {
            console.error('Error comparing logout times:', error);
            return false;
          }
        })())) {
          existing.lastLogout = record.logout;
        }
        
        // Recalculate total hours
        if (existing.firstLogin && existing.lastLogout) {
          try {
            const loginTime = fixDateString(existing.firstLogin);
            const logoutTime = fixDateString(existing.lastLogout);
            
            if (!isNaN(loginTime.getTime()) && !isNaN(logoutTime.getTime())) {
              existing.totalHours = Math.round(((logoutTime.getTime() - loginTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;
            }
          } catch (error) {
            console.error('Error recalculating hours:', error);
          }
        }
        
        // Update status to Present if any record has login
        if (record.login) {
          existing.status = 'Present';
        }
      }
    });

    // Convert grouped data back to array and update login/logout fields
    const finalData = Array.from(groupedData.values()).map(record => {
      // Ensure we have valid data
      const finalRecord = {
        ...record,
        login: record.firstLogin || null,
        logout: record.lastLogout || null,
        hours: record.totalHours || 0,
        status: record.status || 'Absent'
      };
      
      // If no login time, mark as absent
      if (!finalRecord.login) {
        finalRecord.status = 'Absent';
        finalRecord.hours = 0;
      }
      
      return finalRecord;
    });

    // Get all employees for the selected date to include those without records
    const allEmployeesQuery = `
      SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.department,
        d.shift
      FROM details d
      ${department && department !== 'All' ? 'WHERE d.department = $1' : ''}
      ORDER BY d.id
    `;
    
    const allEmployeesParams = department && department !== 'All' ? [department] : [];
    const allEmployeesResult = await pool.query(allEmployeesQuery, allEmployeesParams);
    
    // Create a map of employees who have records
    const employeesWithRecords = new Set(finalData.map(record => record.id));
    
    // Add employees without records
    const employeesWithoutRecords = allEmployeesResult.rows
      .filter(emp => !employeesWithRecords.has(emp.id))
      .map(emp => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown',
        department: emp.department || '',
        shift: emp.shift || '',
        date: startDate || new Date().toISOString().split('T')[0],
        login: null,
        logout: null,
        hours: 0,
        status: 'Absent'
      }));
    
    // Combine both sets of data
    const completeData = [...finalData, ...employeesWithoutRecords];

    return NextResponse.json(completeData);

  } catch (error) {
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