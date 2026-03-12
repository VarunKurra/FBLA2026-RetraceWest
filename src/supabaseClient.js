import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cubsscyukjdvbtmgxmpr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YnNzY3l1a2pkdmJ0bWd4bXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDUwOTEsImV4cCI6MjA4ODY4MTA5MX0.uksoNoNHW_ZMCJ6W79ixEOg8qZLJcaCLuFXRjefbFoY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
