// index.js
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

// Import Git clone controllers
const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");
const { logRepo } = require("./controllers/log");

// Import Supabase client
const { supabase } = require("./supabaseClient");

yargs(hideBin(process.argv))
  // init
  .command("init", "Initialise a new repository", {}, initRepo)

  // add
  .command("add <file>", "Add a file to the repository", (yargs) => {
    yargs.positional("file", {
      describe: "File to add to the staging area",
      type: "string",
    });
  }, addRepo)

  // commit
  .command("commit <message>", "Commit staged changes", (yargs) => {
    yargs.positional("message", {
      describe: "Commit message",
      type: "string",
    });
  }, commitRepo)

  // push
  .command("push", "Push changes to remote repository", {}, pushRepo)

  // pull
  .command("pull", "Pull latest changes from remote repository", {}, pullRepo)

  // revert
  .command("revert <commitId>", "Revert to a specific commit", (yargs) => {
    yargs.positional("commitId", {
      describe: "ID of commit to revert",
      type: "string",
    });
  }, revertRepo)

  // log
  .command("log", "Show commit history", {}, logRepo)

  // fetch users
  .command("fetch-users", "Get all users from Supabase", {}, async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error.message);
      } else if (!data || data.length === 0) {
        console.log("No users found.");
      } else {
        console.table(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  })

  // add user
  .command("add-user <first> <last> <email>", "Add a user to Supabase", (yargs) => {
    yargs
      .positional("first", { describe: "First name", type: "string" })
      .positional("last", { describe: "Last name", type: "string" })
      .positional("email", { describe: "Email address", type: "string" });
  }, async (argv) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ first_name: argv.first, last_name: argv.last, email: argv.email }])
        .select();

      if (error) {
        console.error("Error adding user:", error.message);
        return;
      }

      console.log("User added successfully:", data);
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  })

  .demandCommand(1, "You need at least one command")
  .help()
  .argv;
