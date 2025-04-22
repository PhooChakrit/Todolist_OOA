import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request) {
    try {
        const { id, data } = await request.json();
        console.log('id', id);
        console.log('data', data);
        
        const updatedTodo = await prisma.todoitem.update({
            where: { id: parseInt(id) },
            data: {
                title: data.title,
                data: data.details,
                status: data.status,
                dueDate: data.dueDate,
                completed: data.completed,
            },
        });
        console.log('updatedTodo', updatedTodo);
        
        return NextResponse.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}