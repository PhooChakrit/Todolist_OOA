import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, data } = await request.json();

        const createdTodo = await prisma.todo.create({
            data: {
                userEmail: email,
                ...data,
            },
        });

        return NextResponse.json(createdTodo);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
