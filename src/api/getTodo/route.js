import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(email) {

  try {
    const todo = await prisma.todo.findUnique({
      where: { userEmail: email },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}