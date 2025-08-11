const fs = require("fs").promises;
const path = require("path");

const { supabase } = require("../supabaseClient");

async function addRepo(argv) {
  try {
    // 1. Read the file content (create dummy if not exist)
    const fileToAdd = path.resolve(process.cwd(), argv.file);
    let content;
    try {
      content = await fs.readFile(fileToAdd, "utf-8");
    } catch {
      console.warn(`⚠️ File not found. Creating a dummy file content.`);
      content = "This is a dummy file for testing.\n";
    }

    // 2. Read repo ID from config file
    const configPath = path.resolve(process.cwd(), ".apnaGit", "config.json");
    let config;
    try {
      const configRaw = await fs.readFile(configPath, "utf-8");
      config = JSON.parse(configRaw);
    } catch {
      console.error("❌ Could not read repository config. Have you run 'init'?");
      return;
    }

    const repo_id = config.repositoryId;
    if (!repo_id) {
      console.error("❌ Repository ID missing in config.json");
      return;
    }

    // 3. Insert or update staged file in Supabase
    const { data, error } = await supabase
      .from("staged_files")
      .upsert({
        repo_id,
        file_name: path.basename(argv.file),
        file_path: argv.file,
        content,
        staged_at: new Date().toISOString(),
      }, { onConflict: ["repo_id", "file_path"] });

    if (error) {
      console.error("❌ Error adding file to staging in Supabase:", error.message);
      return;
    }

    console.log(`✅ Added '${argv.file}' to staging area in Supabase.`);
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

module.exports = { addRepo };
