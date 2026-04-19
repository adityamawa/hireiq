import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  // We must call cookies() inside the function, not outside
  return createServerComponentClient({ cookies });
};