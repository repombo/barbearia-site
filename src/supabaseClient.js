import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis do Supabase ausentes. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'
  )
}

// Chave "anon" é segura no front-end porque o RLS protege as tabelas.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
