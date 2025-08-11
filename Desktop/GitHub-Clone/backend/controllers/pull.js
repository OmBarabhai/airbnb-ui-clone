const fs = require("fs").promises;
const path = require("path");
const { supabase } = require("../supabaseClient");

async function pullRepo() {
  try {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");

    // 1. Read config to get repo ID
    const configRaw = await fs.readFile(path.join(repoPath, "config.json"), "utf-8");
    const config = JSON.parse(configRaw);
    const repositoryId = config.repositoryId;
    if (!repositoryId) {
      console.error("❌ Repository ID missing in config.json");
      return;
    }

    // 2. Fetch all commits from Supabase for this repo
    const { data: commits, error: commitsError } = await supabase
      .from("commits")
      .select("*")
      .eq("repository_id", repositoryId);

    if (commitsError) {
      console.error("❌ Error fetching commits:", commitsError.message);
      return;
    }

    if (!commits || commits.length === 0) {
      console.log("⚠️ No commits found in remote repository.");
      return;
    }

    // 3. For each commit, fetch staged files or commit files associated
    for (const commit of commits) {
      const commitFolder = path.join(commitsPath, commit.id);
      await fs.mkdir(commitFolder, { recursive: true });

      // Save commit message
      await fs.writeFile(path.join(commitFolder, "message.txt"), commit.message);

      // Fetch files for this commit from supabase (assuming you have a commit_files or staged_files table)
      const { data: files, error: filesError } = await supabase
        .from("commit_files")  // or your files table
        .select("*")
        .eq("commit_id", commit.id);

      if (filesError) {
        console.error(`❌ Error fetching files for commit ${commit.id}:`, filesError.message);
        continue;
      }

      // Write each file locally
      for (const file of files) {
        const filePath = path.join(commitFolder, file.file_name);
        await fs.writeFile(filePath, file.content);
      }
    }

    console.log("✅ Pulled all commits from remote Supabase.");
  } catch (err) {
    console.error("❌ Error pulling from remote:", err.message);
  }
}

module.exports = { pullRepo };
