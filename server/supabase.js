const supabaseObject = require('@supabase/supabase-js')

const supabaseUrl = 'https://fhdsmgbcnjzqakudimet.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHNtZ2Jjbmp6cWFrdWRpbWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNDcxOTksImV4cCI6MjA0MDkyMzE5OX0.q7UtKFSdgrXUPCr1sFSAlKbkRdi8dp6TyGbQ3yBvK8w'
const supabase = supabaseObject.createClient(supabaseUrl, supabaseKey)

module.exports = supabase
