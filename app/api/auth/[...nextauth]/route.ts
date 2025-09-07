import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // Use OAuth 2.0
      authorization: {
        params: {
          scope: "tweet.read users.read tweet.write offline.access"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.userId = account.providerAccountId
        token.username = (profile as any).username
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        userId: token.userId,
        username: token.username,
      }
    }
  },
  pages: {
    signIn: '/twitter',
    error: '/twitter'
  }
})

export { handler as GET, handler as POST }