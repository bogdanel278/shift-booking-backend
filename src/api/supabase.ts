import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { Database } from '../types/database';

// Initialize Supabase client with environment variables
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
    urlLoaded: !!supabaseUrl,
    keyLoaded: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 20),
    keyPrefix: supabaseAnonKey?.substring(0, 20)
});

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});

console.log('✅ Supabase client initialized successfully');
