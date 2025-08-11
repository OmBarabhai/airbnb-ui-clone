const fs = require("fs").promises;
const path = require("path");
const { supabase } = require("../supabaseClient");

async function commitRepo(argv) {
  try {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");

    // 1. Check if repo exists locally
    try {
      await fs.access(repoPath);
    } catch {
      console.error("❌ No repository found. Run 'node index.js init' first.");
      return;
    }

    // 2. Read repo ID from config.json
    const configPath = path.join(repoPath, "config.json");
    let config;
    try {
      const configRaw = await fs.readFile(configPath, "utf-8");
      config = JSON.parse(configRaw);
    } catch {
      console.error("❌ Could not read repository config. Have you run 'init'?");
      return;
    }

    const repositoryId = config.repositoryId;
    if (!repositoryId) {
      console.error("❌ Repository ID missing in config.json");
      return;
    }

    // 3. Fetch staged files from Supabase
    const { data: stagedFiles, error: fetchError } = await supabase
      .from("staged_files")
      .select("*")
      .eq("repo_id", repositoryId);

    if (fetchError) {
      console.error("❌ Error fetching staged files:", fetchError.message);
      return;
    }

    if (!stagedFiles || stagedFiles.length === 0) {
      console.warn("⚠️ No files in staging area. Nothing to commit.");
      return;
    }

    // 4. Insert commit info into Supabase and get the ID
    const { data: commitData, error: commitError } = await supabase
      .from("commits")
      .insert([
        { repository_id: repositoryId, message: argv.message }
      ])
      .select("id")
      .single();

    if (commitError) {
      console.error("❌ Error inserting commit in Supabase:", commitError.message);
      return;
    }
    const commitId = commitData.id;

    // 5. Create commit folder locally
    const commitFolder = path.join(commitsPath, commitId);
    await fs.mkdir(commitFolder, { recursive: true });

    // 6. Save commit message locally
    await fs.writeFile(path.join(commitFolder, "message.txt"), argv.message);

    // 7. Save files locally + insert into commit_files table
    for (const file of stagedFiles) {
      const filePath = path.join(commitFolder, file.file_name);
      await fs.writeFile(filePath, file.content);

      const { error: fileInsertError } = await supabase
        .from("commit_files")
        .insert([
          {
            commit_id: commitId,
            file_name: file.file_name,
            content: file.content
          }
        ]);

      if (fileInsertError) {
        console.error(`❌ Error inserting file ${file.file_name}:`, fileInsertError.message);
      }
    }

    // 8. Clear staging area in Supabase
    const { error: deleteError } = await supabase
      .from("staged_files")
      .delete()
      .eq("repo_id", repositoryId);

    if (deleteError) {
      console.error("❌ Error clearing staged files:", deleteError.message);
      return;
    }

    console.log(`✅ Commit created: ${commitId}`);
    console.log(`📜 Message: ${argv.message}`);

  } catch (err) {
    console.error("❌ Error during commit:", err.message);
  }
}

module.exports = { commitRepo };
