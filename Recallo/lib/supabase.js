// npm install @supabase/supabase-js
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// Get Supabase config from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://jyyzccmpngjuiphyahoz.supabase.co'
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eXpjY21wbmdqdWlwaHlhaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODA3OTEsImV4cCI6MjA3OTM1Njc5MX0.4VvfHkGXIlr6OeAZWlJO3_IncFGKU-nW4wZQxEpcHpg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})