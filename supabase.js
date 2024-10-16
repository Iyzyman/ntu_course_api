require('dotenv').config() // Load environment variables from .env file
const supabaseObject = require('@supabase/supabase-js')

const supabaseUrl = 'https://fhdsmgbcnjzqakudimet.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY // Get the key from .env

const supabase = supabaseObject.createClient(supabaseUrl, supabaseKey)

module.exports = supabase
