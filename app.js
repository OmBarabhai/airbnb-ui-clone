const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Images array - ONLY the ones you actually have
const images = [
  "/images/beach-cottage.jpg",
  "/images/beachfront-paradise.jpg",
  "/images/boston-brownstone.jpg",
  "/images/canal-house.jpg",
  "/images/city-penthouse.jpg",
  "/images/cotswolds-cottage.jpg",
  "/images/modern-loft.jpg",
  "/images/mountain-retreat.jpg",  // Changed from .jpeg to .jpg
  "/images/private-island.jpg",
  "/images/treehouse-getaway.jpg",
  "/images/tuscany-villa.jpg"
];

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
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Listings route with images
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  
  // Add images to each listing
  const listingsWithImages = allListings.map((listing, index) => {
    return {
      ...listing.toObject(),
      image: images[index % images.length], // Changed from randomImage to image
      rating: (4.0 + Math.random() * 1.0).toFixed(1), // Random rating
      location: listing.location || 'Private room in city center',
      availability: 'Available now'
    };
  });
  
  res.render("listings/index.ejs", { allListings: listingsWithImages });
});

// Test route to check images
app.get("/test-images", (req, res) => {
  const imageList = images.map(img => `<img src="${img}" style="width: 200px; margin: 10px;" alt="test" />`).join('');
  res.send(`<h2>Image Test</h2>${imageList}`);
});

// Rest of your routes
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

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/test", (req, res) => {
  res.render("testNavbar");
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
    res.redirect("/listings");
  } catch (err) {
    console.error("Error saving listing:", err);
    res.status(500).send("Failed to save listing.");
  }
});

app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  console.log("Updating listing with data:", req.body);

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

// Updated show route with image
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  
  // Add image and other enhancements to the listing
  const enhancedListing = {
    ...listing.toObject(),
    image: images[Math.floor(Math.random() * images.length)], // Random image
    rating: (4.0 + Math.random() * 1.0).toFixed(1), // Random rating
  };
  
  res.render("listings/show.ejs", { listing: enhancedListing });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});