import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
    try {
        const { id, data } = await request.json();

        const updatedTodo = await prisma.todo.update({
            where: { id: id },
            data,
        });

        return NextResponse.json(updatedTodo);
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}