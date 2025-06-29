import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting details table creation...');
    
    // Read data.json file
    const dataPath = path.join(process.cwd(), 'public', 'data.json');
    console.log('Reading file from:', dataPath);
    
    if (!fs.existsSync(dataPath)) {
      throw new Error(`File not found: ${dataPath}`);
    }
    
    const dataContent = fs.readFileSync(dataPath, 'utf-8');
    const employeesData = JSON.parse(dataContent);
    console.log('Successfully read data.json, found', Object.keys(employeesData).length, 'employees');

    // Test database connection
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    // Create details table
    console.log('Creating details table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS details (
        id INTEGER PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        shift VARCHAR(50)
      )
    `);
    console.log('Table created successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await pool.query('DELETE FROM details');
    console.log('Existing data cleared');

    // Insert data from data.json
    console.log('Inserting data...');
    let insertedCount = 0;
    for (const [id, employee] of Object.entries(employeesData)) {
      const employeeData = employee as any;
      
      await pool.query(
        'INSERT INTO details (id, first_name, last_name, department, shift) VALUES ($1, $2, $3, $4, $5)',
        [parseInt(id), employeeData['First Name'], employeeData['Last Name'], employeeData['Department'], employeeData['Shift']]
      );
      
      insertedCount++;
    }
    console.log('Data insertion completed, inserted', insertedCount, 'records');

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الجدول وإدخال البيانات بنجاح',
      insertedCount
    });

  } catch (error) {
    console.error('Error creating details table:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء إنشاء الجدول أو إدخال البيانات',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM details ORDER BY id');
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching details:', error);
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