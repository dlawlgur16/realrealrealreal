import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase 설정
// TODO: Supabase 프로젝트 생성 후 아래 값을 업데이트하세요
// https://supabase.com 에서 무료 프로젝트 생성

const SUPABASE_URL = 'https://vjpxhbhfganqgtuuorja.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hHbl7rCO0klYlapLXMu_ZA_rJLdkdM4';

// Supabase 클라이언트 생성
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Storage bucket 이름
export const STORAGE_BUCKET = 'oceanseal-images';
