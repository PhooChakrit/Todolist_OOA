import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
    try {
        const { id } = await request.json();

        const deletedTodo = await prisma.todo.delete({
            where: { id: id },
        });

        return NextResponse.json(deletedTodo);
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
