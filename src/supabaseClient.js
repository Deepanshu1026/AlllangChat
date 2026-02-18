import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dneijlwgjnbtdyqlsasd.supabase.co';
const supabaseKey = 'sb_publishable_1dJcDLQg0FbEOOzyGocX1A_IoNHsxuk';

export const supabase = createClient(supabaseUrl, supabaseKey);
