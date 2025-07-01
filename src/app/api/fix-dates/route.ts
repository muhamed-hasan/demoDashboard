import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    // First, check if there are any records with wrong year
    const checkResult = await pool.query(`
      SELECT 
        id, 
        time, 
        date,
        EXTRACT(YEAR FROM time) as year_from_time,
        EXTRACT(YEAR FROM date) as year_from_date
      FROM table3 
      WHERE EXTRACT(YEAR FROM time) < 2020 OR EXTRACT(YEAR FROM date) < 2020
      ORDER BY time DESC 
      LIMIT 5
    `);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No records with wrong year found',
        checked_records: 0
      });
    }
    
    // Fix the dates by updating the year to 2025
    const updateResult = await pool.query(`
      UPDATE table3 
      SET 
        time = time + INTERVAL '24 years',
        date = date + INTERVAL '24 years'
      WHERE EXTRACT(YEAR FROM time) < 2020 OR EXTRACT(YEAR FROM date) < 2020
    `);
    
    // Get updated records to verify
    const verifyResult = await pool.query(`
      SELECT 
        id, 
        time, 
        date,
        EXTRACT(YEAR FROM time) as year_from_time,
        EXTRACT(YEAR FROM date) as year_from_date
      FROM table3 
      ORDER BY time DESC 
      LIMIT 10
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Dates fixed successfully',
      checked_records: checkResult.rows,
      updated_records: verifyResult.rows,
      rows_affected: updateResult.rowCount
    });
    
  } catch (error) {
    console.error('Error fixing dates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix dates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 