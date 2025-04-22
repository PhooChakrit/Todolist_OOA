import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('id', id);

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const todoId = parseInt(id, 10);
    
    if (isNaN(todoId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const deletedTodo = await prisma.todoitem.delete({
      where: { id: todoId },
    });

    return NextResponse.json(deletedTodo);
  } catch (error) {
    console.error('Delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}