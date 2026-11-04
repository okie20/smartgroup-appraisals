import { createClient } from '@supabase/supabase-js'

// This tells Vite to pull the keys from Netlify's Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey)