import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('data', data);
    
    const createdTodo = await prisma.todoitem.create({
      data: {
        userEmail: data.userEmail,
        title: data.title,
        data: data.data,
        status: data.status,
        dueDate : data.dueDate,
        completed: data.completed,
      },
    });
    
    return NextResponse.json(createdTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}