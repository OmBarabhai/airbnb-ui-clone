const fs = require("fs").promises;
const path = require("path");
const { supabase } = require("../supabaseClient");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    // If repo already exists locally, stop
    try {
      await fs.access(repoPath);
      console.log("Repository already exists at:", repoPath);
      return;
    } catch (err) {
      // Folder doesn't exist, continue
    }

    // Step 1: Create repo record in Supabase
    const repoName = path.basename(process.cwd()); // folder name as repo name
    const { data, error } = await supabase
      .from("repositories")
      .insert([{ name: repoName }])
      .select("id")
      .single();

    if (error) {
      console.error("❌ Error creating repository in Supabase:", error.message);
      return;
    }

    const repositoryId = data.id;

    // Step 2: Create local repo folders
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    // Step 3: Write config.json with repoId + bucket name
    const bucketName = process.env.S3_BUCKET || "default-bucket";
    const configData = {
      bucket: bucketName,
      repositoryId,
      created: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(configData, null, 2)
    );

    console.log(`✅ Repository initialised at: ${repoPath}`);
    console.log(`🆔 Repository ID: ${repositoryId}`);
    console.log("📦 Config file created with bucket:", bucketName);

  } catch (err) {
    console.error("❌ Error initialising repository:", err.message);
  }
}

module.exports = { initRepo };
