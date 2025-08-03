const express = require("express");
const path = require("path");

const mongoose = require("mongoose");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const Listing = require("./models/listing.js");

const methodOverride = require("method-override");

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}

main().catch((err) => {
  console.error("MongoDB connection error:", err);
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

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
    country: "India",
  });

  await sampleListing.save();
  console.log("Sample was saved");
  res.send("Successful testing");
});

app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

app.post("/listings", async (req, res) => {
  try {
    let listingData = req.body.listing;
    let newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings"); // redirect to show all listings
  } catch (err) {
    console.error("Error saving listing:", err);
    res.status(500).send("Failed to save listing.");
  }
});

// Edit route
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

//update put
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  console.log("Updating listing with data:", req.body); // 👈 helpful debug

  try {
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).send("Failed to update listing.");
  }
});

app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
