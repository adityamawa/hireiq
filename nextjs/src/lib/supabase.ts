import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This special Next.js client automatically syncs your login state 
// to secure browser cookies so the Server Components can see who you are!
export const supabase = createClientComponentClient();