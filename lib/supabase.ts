import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usbtlexntpiovhkfqnlb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYnRsZXhudHBpb3Zoa2ZxbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTMwODgsImV4cCI6MjA5NzI4OTA4OH0.WNCMHwlI5RcmVB3107Zk91E6akSXidfHn3fCFVpY1Ms';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);