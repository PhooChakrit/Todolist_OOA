import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, name, image } = await request.json();

        const user = await prisma.user.upsert({
            where: { email },
            update: { name, image },
            create: { email, name, image },
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}