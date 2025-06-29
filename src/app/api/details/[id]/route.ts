import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'معرف الموظف غير صحيح' 
        },
        { status: 400 }
      );
    }

    // Check if employee exists
    const checkResult = await pool.query('SELECT * FROM details WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'الموظف غير موجود' 
        },
        { status: 404 }
      );
    }

    // Delete employee
    await pool.query('DELETE FROM details WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الموظف بنجاح'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء حذف الموظف',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 