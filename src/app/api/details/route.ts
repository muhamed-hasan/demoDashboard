import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, department, shift } = body;

    // Validation
    if (!first_name || !last_name || !department) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'الاسم الأول والاسم الأخير والقسم مطلوبة' 
        },
        { status: 400 }
      );
    }

    if (first_name.trim().length < 2 || last_name.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'الاسم الأول والاسم الأخير يجب أن يكونا على الأقل حرفين' 
        },
        { status: 400 }
      );
    }

    // Get the next available ID
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM details');
    const nextId = maxIdResult.rows[0].max_id + 1;

    // Insert new employee
    const result = await pool.query(
      'INSERT INTO details (id, first_name, last_name, department, shift) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nextId, first_name.trim(), last_name.trim(), department, shift || '']
    );

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الموظف بنجاح',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء إضافة الموظف',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 