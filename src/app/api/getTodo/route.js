import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // ดึงค่า email จาก query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    // ดึงรายการ todo ทั้งหมดของผู้ใช้
    const todos = await prisma.todoitem.findMany({
      where: { userEmail: email },
    });
    console.log('todos', todos);
    
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}