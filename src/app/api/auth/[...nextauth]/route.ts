import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { NextAuthOptions } from 'next-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return { ...session, user: { ...session.user, ...data } };
    },
    async signIn() {
      return true;
    },
    async redirect({ baseUrl }: { baseUrl: string }) {
      return baseUrl;
    },
    async jwt({ token }: { token: any }) {
      return token;
    },
  },
  events: {
    async createUser({ user }: { user: any }) {
      // Create a user profile when a new user signs up
      await supabase
        .from('profiles')
        .insert([
          { 
            id: user.id,
            email: user.email,
            name: user.name || user.email?.split('@')[0],
            avatar_url: user.image,
            created_at: new Date().toISOString(),
          },
        ]);
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
