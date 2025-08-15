import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw error;
  }
  
  return data;
};

export const signInWithGoogle = async () => {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    throw error;
  }
};

export const signOut = async () => {
  const supabase = createClientComponentClient<Database>();
  await supabase.auth.signOut();
  window.location.href = '/auth/login';
};
