// import { createClient } from '@supabase/supabase-js';

const supabaseObject = require('@supabase/supabase-js');

// console.log(supabaseObject);
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// // Supabase public API key, okay to expose if proper RLS policies in place
// const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

const supabaseUrl = 'https://fhdsmgbcnjzqakudimet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHNtZ2Jjbmp6cWFrdWRpbWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNDcxOTksImV4cCI6MjA0MDkyMzE5OX0.q7UtKFSdgrXUPCr1sFSAlKbkRdi8dp6TyGbQ3yBvK8w';
const supabase = supabaseObject.createClient(supabaseUrl, supabaseKey);

// console.log(supabase);
// export default supabase;

module.exports = supabase;