// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // ดึง token จาก account
      const accessToken = account?.access_token;
      
      if (accessToken) {
        // เรียกใช้ callback ของคุณผ่าน fetch
        try {
          await fetch(`${process.env.WEB_URL}/callback?token=${accessToken}`);
          // หรือใช้โค้ดจาก callback ของคุณโดยตรงที่นี่
        } catch (error) {
          console.error("Error calling custom callback:", error);
        }
      }
      
      return true; // อนุญาตให้ล็อกอิน
    },
    // callbacks อื่นๆ...
  },
});

export { handler as GET, handler as POST };