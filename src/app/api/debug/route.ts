import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get sample data from table3 to check the actual date format
    const result = await pool.query(`
      SELECT id, time, date, time2, fname, lname, name 
      FROM table3 
      ORDER BY time DESC 
      LIMIT 10
    `);
    
    // Also check the details table
    const detailsResult = await pool.query(`
      SELECT id, first_name, last_name, department, shift 
      FROM details 
      ORDER BY id 
      LIMIT 10
    `);
    
    return NextResponse.json({
      success: true,
      table3_sample: result.rows,
      details_sample: detailsResult.rows,
      message: 'Debug data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve debug data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 