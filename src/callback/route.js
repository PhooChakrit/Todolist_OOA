'use server';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { SignJWT } from "jose";
import { TextEncoder } from "util";
import { cookies } from 'next/headers';
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
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Google user info:", data);
        return data;
    } catch (error) {
        console.error("Error fetching Google user info:", error);
        throw new Error("Failed to fetch Google user info");
    }
}

export async function GET(req) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
        const googleUserInfo = await fetchGoogleUserInfo(token);

        if (!googleUserInfo) {
            return NextResponse.json({ error: 'Failed to fetch Google user info' }, { status: 400 });
        }

        
        console.log("Google user info:", googleUserInfo);
        

        const User = {
            id: googleUserInfo.sub || '', // Google user ID
            email: googleUserInfo.email || '',
            name: googleUserInfo.name || '',
            picture: googleUserInfo.picture || '',
        };

        const key = new TextEncoder().encode(process.env.JWT_SECRET);
        const accessToken = await new SignJWT({ id: User.id, role: role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer(`${process.env.WEB_URL}`)
            .setExpirationTime(process.env.JWT_TIMEOUT)
            .sign(key);

        // Set the token as a cookie using NextResponse
        const response = NextResponse.redirect(`${process.env.WEB_URL}/user/${User.id}/home`);
        response.cookies.set('token', accessToken, {
            httpOnly: true,
            path: '/',
        });

        await prisma.user.upsert({
            where: { id: User.id },
            update: User,
            create: User,
        });

        console.log(`User ${User.id} logged in`);
        return response;
    } catch (error) {
        console.error("Error processing Google login callback:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
