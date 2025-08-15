import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createClientWithCookies = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
};

export const getCurrentUser = async () => {
  const supabase = createClientWithCookies();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};

export const getCurrentUserWithRole = async () => {
  const supabase = createClientWithCookies();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  const { data: userWithRole } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  return userWithRole;
};
