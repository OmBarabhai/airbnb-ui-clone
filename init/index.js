const mongoose = require("mongoose");
const data = require("./data.js");

const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}

main().catch((err) => {
  console.error("MongoDB connection error:", err);
});

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(data.data); // ✅ Corrected this line
  console.log("Data was initialized");
};

initDB();
