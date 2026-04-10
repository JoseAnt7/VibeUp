// src/supabaseClient.js
//85d2166c3e1775ce6ed1ec197812b9dc

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xhemnniowembyfiqcjra.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZW1ubmlvd2VtYnlmaXFjanJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODM2NTQsImV4cCI6MjA4OTM1OTY1NH0.srRFGVBUXepjCZ3ABw9QDHqmCfAf6Av726PRdTP845c";

export const supabase = createClient(supabaseUrl, supabaseKey);