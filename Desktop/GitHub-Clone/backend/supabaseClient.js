// supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://rpcjeicrvbxitkfpjrll.supabase.co"; // Replace with your URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwY2plaWNydmJ4aXRrZnBqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjAwMDQsImV4cCI6MjA3MDQ5NjAwNH0.BrzB3MPdDb7z2Xwo-lDRjp9YbflD8haD-SIM2xYiiVk"; // Replace with your anon key

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
