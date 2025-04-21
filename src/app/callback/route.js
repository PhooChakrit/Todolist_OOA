'use server';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { SignJWT } from "jose";
import { cookies } from 'next/headers';

// สร้าง Prisma client นอกฟังก์ชัน เพื่อป้องกันการสร้างหลาย connections
// ในการใช้งานจริง ควรใช้ PrismaClient แบบ singleton
const prisma = new PrismaClient();
const role = "user";

async function fetchGoogleUserInfo(token) {
  if (!token) {
    throw new Error("Token is required");
  }
  
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Google API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching Google user info:", error);
    throw error; // ส่งต่อ error เพื่อให้สามารถจัดการได้ในฟังก์ชัน GET
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    
    // ตรวจสอบว่า environment variables ถูกตั้งค่าแล้ว
    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    if (!process.env.WEB_URL) {
      console.error("Missing WEB_URL environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    if (!process.env.JWT_TIMEOUT) {
      console.error("Missing JWT_TIMEOUT environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    // เรียกข้อมูลผู้ใช้จาก Google
    const googleUserInfo = await fetchGoogleUserInfo(token);
    
    if (!googleUserInfo || !googleUserInfo.sub) {
      console.error("Invalid Google user info:", googleUserInfo);
      return NextResponse.json({ error: "Invalid user information" }, { status: 400 });
    }
    
    const User = {
      id: googleUserInfo.sub,
      email: googleUserInfo.email || '',
      name: googleUserInfo.name || '',
      picture: googleUserInfo.picture || '',
    };
    
    // สร้าง JWT token
    try {
      const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
      const accessToken = await new SignJWT({ 
        id: User.id, 
        role,
        email: User.email, 
        name: User.name 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(process.env.WEB_URL)
        .setExpirationTime(`${process.env.JWT_TIMEOUT}s`)
        .sign(jwtSecret);
      
      // บันทึกข้อมูลผู้ใช้ลงในฐานข้อมูล
      try {
        await prisma.user.upsert({
          where: { id: User.id },
          update: User,
          create: User,
        });
        console.log(`User data saved/updated for ${User.id}`);
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json({ error: "Database error", details: dbError.message }, { status: 500 });
      }
      
      // สร้าง response และตั้งค่า cookie
      const redirectUrl = `${process.env.WEB_URL}/user/${User.id}/home`;
      const response = NextResponse.redirect(redirectUrl);
      
      // ตั้งค่า cookies
      response.cookies.set('token', accessToken, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production', // ใช้ secure ในโหมด production
        sameSite: 'lax',
        maxAge: parseInt(process.env.JWT_TIMEOUT) * 1000 // แปลงเป็นมิลลิวินาที
      });
      
      console.log(`User ${User.id} logged in successfully`);
      return response;
    } catch (jwtError) {
      console.error("JWT creation error:", jwtError);
      return NextResponse.json({ error: "JWT creation failed", details: jwtError.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in Google login callback:", error);
    return NextResponse.json({
      error: "Authentication failed",
      details: error.message
    }, { status: 500 });
  } finally {
    // ปิดการเชื่อมต่อ Prisma เมื่อเสร็จสิ้นการทำงาน
    await prisma.$disconnect();
  }
}