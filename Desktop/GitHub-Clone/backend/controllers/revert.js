const fs = require("fs").promises;
const path = require("path");

async function revertRepo({ commitId }) {
  try {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const commitsPath = path.join(repoPath, "commits");
    const commitPath = path.join(commitsPath, commitId);

    // Check if local repo exists
    try {
      await fs.access(repoPath);
    } catch {
      console.error("❌ No repository found. Run 'init' first.");
      return;
    }

    // Check if commit exists
    try {
      await fs.access(commitPath);
    } catch {
      console.error(`❌ Commit ${commitId} not found.`);
      return;
    }

    // Restore all files from that commit to working directory
    const files = await fs.readdir(commitPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(commitPath, file),
        path.join(process.cwd(), file)
      );
    }

    console.log(`⏪ Reverted to commit ${commitId}`);
  } catch (err) {
    console.error("❌ Error reverting to commit:", err.message);
  }
}

module.exports = { revertRepo };
