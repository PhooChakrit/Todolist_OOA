'use server';

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // ใช้ getToken จาก next-auth แทน
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("NextAuth token:", token);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ข้อมูลจาก token
    const user = await prisma.user.findUnique({
      where: { id: token.id || token.sub },
    });

    if (!user) {
      console.log("User not found with ID:", token.id || token.sub);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("User found:", user.email);
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}