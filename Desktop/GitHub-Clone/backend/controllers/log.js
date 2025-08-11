// controllers/log.js
const { supabase } = require("../supabaseClient");

async function logRepo() {
  try {
    const { data, error } = await supabase
      .from("commits")
      .select("id, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching commits:", error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log("No commits found.");
      return;
    }

    console.table(data.map(commit => ({
      CommitID: commit.id,
      Message: commit.message,
      Date: new Date(commit.created_at).toLocaleString(),
    })));
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

module.exports = { logRepo };
