import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
  } catch {
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

    console.log('API Request Parameters:', {
      startDate,
      endDate,
      departments,
      shift,
      searchText,
      page,
      limit,
      offset
    });

    // Build the JOIN query with filters
    const baseQuery = `
      FROM table3 t
      LEFT JOIN details d ON t.id = d.id::text
    `;
    const whereConditions: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    // Date range filter
    if (startDate && endDate) {
      whereConditions.push(`DATE(t.time) >= $${paramIndex} AND DATE(t.time) <= $${paramIndex + 1}`);
      values.push(startDate, endDate);
      paramIndex += 2;
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

    console.log('Query Details:', {
      baseQuery,
      whereClause,
      values,
      paramIndex
    });

    // Get total count for pagination (on filtered data)
    const countQuery = `
      SELECT COUNT(*) ${baseQuery} ${whereClause}
    `;
    console.log('Count Query:', countQuery);
    console.log('Count Values:', values);
    
    const countResult = await pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);
    
    console.log('Count Result:', {
      totalCount,
      countResult: countResult.rows[0]
    });

    // Get paginated data with JOIN
    const dataQuery = `
      SELECT 
        t.id,
        t.time,
        t.date,
        t.time2,
        t.fname,
        t.lname,
        t.name,
        t.rname,
        t."group",
        t.card_number,
        t.pic,
        t.dev,
        d.first_name,
        d.last_name,
        d.department,
        d.shift
      ${baseQuery} 
      ${whereClause} 
      ORDER BY t.time DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataValues = [...values, limit, offset];
    console.log('Data Query:', dataQuery);
    console.log('Data Values:', dataValues);
    
    const result = await pool.query(dataQuery, dataValues);
    
    console.log('Data Result:', {
      rowCount: result.rows.length,
      firstRow: result.rows[0],
      lastRow: result.rows[result.rows.length - 1]
    });
    
    // Format the data
    const enrichedData = result.rows.map((row: Record<string, unknown>) => {
      // Format date properly
      let formattedDate = row.date;
      if (row.date) {
        try {
          const dateObj = new Date(row.date as string);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString();
          }
        } catch (error) {
          console.error('Error formatting date:', row.date, error);
        }
      }
      
      const enrichedItem = {
        id: row.id,
        time: formatTime(row.time as string),
        fullName: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}`.trim() : row.name || '',
        shift: row.shift || '',
        department: row.department || row.group || '',
        // Additional fields from table3
        date: formattedDate,
        time2: row.time2,
        rname: row.rname,
        card_number: row.card_number,
        dev: row.dev
      };
      
      // Debug log for first few items
      if (result.rows.indexOf(row) < 3) {
        console.log('API Row processing:', {
          originalRow: {
            id: row.id,
            time: row.time,
            date: row.date,
            first_name: row.first_name,
            last_name: row.last_name
          },
          enrichedItem: {
            id: enrichedItem.id,
            time: enrichedItem.time,
            date: enrichedItem.date,
            fullName: enrichedItem.fullName
          }
        });
      }
      
      return enrichedItem;
    });
    
    // Calculate pagination info based on filtered data
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit
    };
    
    console.log('Pagination Info:', paginationInfo);
    console.log('Response Data Length:', enrichedData.length);
    
    return NextResponse.json({
      data: enrichedData,
      pagination: paginationInfo
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      message: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}
