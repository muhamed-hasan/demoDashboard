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
    const departments = searchParams.getAll('department');
    const shift = searchParams.get('shift');
    const searchText = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build the base query with filters
    let baseQuery = 'FROM table3';
    let whereConditions: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      whereConditions.push(`DATE(time) >= $${paramIndex} AND DATE(time) <= $${paramIndex + 1}`);
      values.push(startDate, endDate);
      paramIndex += 2;
    }

    // Add department filter to database query if specified
    if (departments.length > 0) {
      // We'll filter by department after joining with employee data
    }

    // Add search filter to database query if specified
    if (searchText) {
      // We'll filter by search after joining with employee data
    }

    // Build the WHERE clause
    let whereClause = '';
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) ${baseQuery} ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated data
    const dataQuery = `
      SELECT * ${baseQuery} 
      ${whereClause} 
      ORDER BY time DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);
    
    const result = await pool.query(dataQuery, values);
    
    // Load employee data from JSON file
    const jsonFilePath = path.join(process.cwd(), 'public', 'data.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const employeeData: EmployeeRecord = JSON.parse(jsonData);
    
    // Enrich database records with employee information
    let enrichedData = result.rows.map((row: any) => {
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
    
    // Apply client-side filters that couldn't be done at database level
    if (departments.length > 0) {
      enrichedData = enrichedData.filter(item => 
        departments.includes(item.department)
      );
    }
    
    if (shift && shift !== 'all') {
      enrichedData = enrichedData.filter(item => 
        item.shift?.toLowerCase() === shift.toLowerCase()
      );
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      enrichedData = enrichedData.filter(item => 
        item.fullName.toLowerCase().includes(searchLower) ||
        item.department.toLowerCase().includes(searchLower) ||
        item.shift.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      data: enrichedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
