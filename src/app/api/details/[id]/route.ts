import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('Delete request received with params:', resolvedParams);
    
    // Check if params.id exists
    if (!resolvedParams || !resolvedParams.id) {
      console.log('No params or params.id found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'معرف الموظف مطلوب' 
        },
        { status: 400 }
      );
    }

    console.log('Parsing ID:', resolvedParams.id);
    const id = parseInt(resolvedParams.id);
    console.log('Parsed ID:', id);
    
    if (isNaN(id)) {
      console.log('Invalid ID format');
      return NextResponse.json(
        { 
          success: false, 
          error: 'معرف الموظف غير صحيح' 
        },
        { status: 400 }
      );
    }

    console.log('Checking if employee exists with ID:', id);
    // Check if employee exists
    const checkResult = await pool.query('SELECT * FROM details WHERE id = $1', [id]);
    console.log('Check result rows:', checkResult.rows.length);
    
    if (checkResult.rows.length === 0) {
      console.log('Employee not found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'الموظف غير موجود' 
        },
        { status: 404 }
      );
    }

    console.log('Deleting employee with ID:', id);
    // Delete employee
    await pool.query('DELETE FROM details WHERE id = $1', [id]);
    console.log('Employee deleted successfully');

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