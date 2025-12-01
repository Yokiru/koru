import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing - REMOVE AFTER TESTING
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://junmgwnujtqcbsmlteam.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bm1nd251anRxY2JzbWx0ZWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzY4NDMsImV4cCI6MjA3OTQ1Mjg0M30.3M7M8awvEWtx1MNvav6IWR-BOPGd4ZX7xQ2doFoSFi0';

console.log('🔍 Supabase Config:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
    usingFallback: !import.meta.env.VITE_SUPABASE_URL
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});
