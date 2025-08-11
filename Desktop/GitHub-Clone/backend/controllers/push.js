const fs = require("fs").promises;
const path = require("path");

async function pushRepo() {
  try {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const remotePath = path.resolve(process.cwd(), ".apnaGitRemote");

    // 1. Check if local repo exists
    try {
      await fs.access(repoPath);
    } catch {
      console.error("❌ No repository found. Run 'node index.js init' first.");
      return;
    }

    // 2. Ensure remote folder exists
    await fs.mkdir(remotePath, { recursive: true });

    // 3. Copy commits to remote folder
    const commitsPath = path.join(repoPath, "commits");
    const remoteCommitsPath = path.join(remotePath, "commits");

    await fs.mkdir(remoteCommitsPath, { recursive: true });

    const commits = await fs.readdir(commitsPath);
    for (const commit of commits) {
      const src = path.join(commitsPath, commit);
      const dest = path.join(remoteCommitsPath, commit);

      try {
        await fs.access(dest); // Skip if already pushed
      } catch {
        await fs.cp(src, dest, { recursive: true });
        console.log(`📤 Pushed commit: ${commit}`);
      }
    }

    console.log("✅ All commits pushed to remote.");
  } catch (err) {
    console.error("❌ Error pushing to remote:", err.message);
  }
}

module.exports = { pushRepo };
