import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = 'SELECT * FROM table3';
    const values: string[] = [];

    if (startDate && endDate) {
      query += ' WHERE date >= $1 AND date <= $2';
      values.push(startDate, endDate);
    }

    query += ' ORDER BY time DESC';
    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 