import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get sample data from table3 to check the actual date format
    const result = await pool.query(`
      SELECT 
        id, 
        time, 
        date, 
        time2, 
        fname, 
        lname, 
        name,
        EXTRACT(YEAR FROM time) as year_from_time,
        EXTRACT(YEAR FROM date) as year_from_date,
        EXTRACT(MONTH FROM time) as month_from_time,
        EXTRACT(DAY FROM time) as day_from_time,
        EXTRACT(HOUR FROM time) as hour_from_time,
        EXTRACT(MINUTE FROM time) as minute_from_time
      FROM table3 
      ORDER BY time DESC 
      LIMIT 10
    `);
    
    // Check if there are any records with wrong year
    const wrongYearResult = await pool.query(`
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
    
    // Get current date for comparison
    const currentDate = new Date();
    
    // Test JavaScript Date parsing
    const testDates = result.rows.slice(0, 3).map(row => {
      const jsDate = new Date(row.time);
      return {
        original: row.time,
        js_parsed: jsDate,
        js_year: jsDate.getFullYear(),
        js_month: jsDate.getMonth() + 1,
        js_day: jsDate.getDate(),
        js_hours: jsDate.getHours(),
        js_minutes: jsDate.getMinutes()
      };
    });
    
    return NextResponse.json({
      success: true,
      sample_data: result.rows,
      wrong_year_data: wrongYearResult.rows,
      javascript_parsing_test: testDates,
      current_date: currentDate.toISOString(),
      current_year: currentDate.getFullYear(),
      message: 'Date check completed successfully'
    });
    
  } catch (error) {
    console.error('Error in date check endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check dates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 