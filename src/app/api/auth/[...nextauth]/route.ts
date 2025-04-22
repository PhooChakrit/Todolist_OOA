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
      const accessToken = account?.access_token;
      if (accessToken) {
        try {
          await fetch(`${process.env.WEB_URL}/callback?token=${accessToken}`);
        } catch (error) {
          console.error("Error calling custom callback:", error);
        }
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };