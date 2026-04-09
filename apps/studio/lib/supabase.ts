import { createClient } from '@supabase/supabase-js'

// Vibe Coding 1인 창업 가이드에 따른 무료 Auth & DB 세팅 (5만 MAU 무료 한도)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-ur-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
