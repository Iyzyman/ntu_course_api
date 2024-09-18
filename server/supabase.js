// import { createClient } from '@supabase/supabase-js';

const supabaseObject = require('@supabase/supabase-js');

// console.log(supabaseObject);
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// // Supabase public API key, okay to expose if proper RLS policies in place
// const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

const supabaseUrl = '';
const supabaseKey = '';
const supabase = supabaseObject.createClient(supabaseUrl, supabaseKey);

// console.log(supabase);
// export default supabase;

module.exports = supabase;