// // src/app/api/auth/[...nextauth]/route.ts
// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     accessToken?: string;
//   }
// }
// import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//           scope: "openid email profile https://www.googleapis.com/auth/calendar"
//         }
//       }
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       // ดึง token จาก account
//       const accessToken = account?.access_token;
      
//       if (accessToken) {
//         // เรียกใช้ callback ของคุณผ่าน fetch
//         try {
//           await fetch(`${process.env.WEB_URL}/callback?token=${accessToken}`);
//         } catch (error) {
//           console.error("Error calling custom callback:", error);
//         }
//       }
      
//       return true; // อนุญาตให้ล็อกอิน
//     },
//     async jwt({ token, account }) {
//       // เก็บ access token และ refresh token
//       if (account) {
//         token.accessToken = account.access_token;
//         token.refreshToken = account.refresh_token;
//         token.expiresAt = account.expires_at;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // ส่ง token ไปยัง client
//       session.accessToken = token.accessToken;

//       return session;
//     },
//   }
// });

// export { handler as GET, handler as POST };
// 


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