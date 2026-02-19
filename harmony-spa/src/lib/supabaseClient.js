import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prpszvevpurpchhhsywl.supabase.co'; // Reemplaza esto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycHN6dmV2cHVycGNoaGhzeXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTgzNDAsImV4cCI6MjA4NjQ5NDM0MH0.1qxDBfXRFErH7pPpS59vnjEUT5ZKgOKkWz-H5ZpW5vw';          // Reemplaza esto

export const supabase = createClient(supabaseUrl, supabaseKey);