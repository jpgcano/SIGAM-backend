import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testSupabaseConnection() {
    const { error } = await supabase.from('_not_a_table_').select('*').limit(1);

    // Depending on PostgREST/Supabase version, missing table can return
    // PGRST116 or PGRST205. Both indicate the API is reachable.
    const allowedMissingTableCodes = new Set(['PGRST116', 'PGRST205']);
    if (error && !allowedMissingTableCodes.has(error.code)) {
        throw error;
    }

    return { ok: true };
}
