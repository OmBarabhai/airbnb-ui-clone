const express = require("express");
const mongoose = require("mongoose");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const Listing = require("../models/listing.js");

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}

main().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Route to insert a test listing
app.get("/testListing", async (req, res) => {
  let sampleListing = new Listing({
    title: "My New Villa",
    description: "By the beach",
    price: 1200,
    location: "Calangute, Goa",
    country: "India"
  });

  await sampleListing.save();
  console.log("Sample was saved");
  res.send("Successful testing");
});

app.get("/listing", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.send(`<pre>${JSON.stringify(listings, null, 2)}</pre>`);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).send("Server error");
  }
});


app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
