import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import GoogleProvider from 'next-auth/providers/google';

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
    async session({ session, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      const supabase = createRouteHandlerClient({ cookies });
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: data?.role || 'user',
        },
      };
    },
  },
  events: {
    async createUser(message) {
      // Create a user in your database when a new user signs up
      const supabase = createRouteHandlerClient({ cookies });
      await supabase
        .from('users')
        .insert([
          { 
            id: message.user.id, 
            email: message.user.email,
            name: message.user.name,
            image: message.user.image,
            role: 'user' // Default role
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

const handler = async (req: Request, context: any) => {
  const { auth } = await import('@/auth');
  return await (auth as any)(req, context);
};

export { handler as GET, handler as POST };
