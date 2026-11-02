import { createClient } from '@supabase/supabase-js'

// Replace these strings with your actual values from your Supabase Settings -> API tab
const supabaseUrl = 'https://cmxirvcamhmjagfmxcqu.supabase.co'
const supabaseAnonKey = 'sb_publishable_39FOCZKvOlPHEIRNApNEdQ_1N8BCcbX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
