const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Enhanced images array with better variety
const images = [
  "/images/beach-cottage.jpg",
  "/images/beachfront-paradise.jpg", 
  "/images/boston-brownstone.jpg",
  "/images/canal-house.jpg",
  "/images/city-penthouse.jpg",
  "/images/cotswolds-cottage.jpg",
  "/images/modern-loft.jpg",
  "/images/mountain-retreat.jpg",
  "/images/private-island.jpg",
  "/images/treehouse-getaway.jpg",
  "/images/tuscany-villa.jpg"
];

// Helper function to get consistent image for listing
const getListingImage = (listingId, index = null) => {
  if (index !== null) {
    return images[index % images.length];
  }
  // Use listing ID to get consistent image
  const hash = listingId.toString().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return images[Math.abs(hash) % images.length];
};

// Helper function to generate random rating
const generateRating = () => (4.0 + Math.random() * 1.0).toFixed(1);

// Connect to MongoDB with better error handling
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

main();

// Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Enhanced root route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Enhanced listings route with search and filtering
app.get("/listings", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, country } = req.query;
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Country filtering
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    
    const allListings = await Listing.find(query);
    
    // Add enhanced data to each listing
    const listingsWithImages = allListings.map((listing, index) => {
      // Use image URL from database or fallback to generated image
      const imageUrl = listing.image?.url || getListingImage(listing._id, index);
      
      return {
        ...listing.toObject(),
        image: imageUrl,
        rating: generateRating(),
        reviewCount: Math.floor(Math.random() * 100) + 10,
        isNewListing: Math.random() > 0.7,
        isSuperhost: Math.random() > 0.6,
        availability: 'Available now',
        distance: Math.floor(Math.random() * 50) + 1 // km from city center
      };
    });
    
    // Get unique countries for filter dropdown
    const countries = await Listing.distinct('country');
    
    // Always pass searchParams, even if they're undefined/empty
    const searchParams = {
      search: search || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      country: country || ''
    };
    
    res.render("listings/index.ejs", { 
      allListings: listingsWithImages,
      countries,
      searchParams
    });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).send("Failed to load listings");
  }
});

// New listing form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show individual listing with enhanced data
app.get("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    
    // Enhanced listing data
    const enhancedListing = {
      ...listing.toObject(),
      image: listing.image?.url || getListingImage(listing._id),
      images: [
        listing.image?.url || getListingImage(listing._id),
        images[(Math.abs(listing._id.toString().charCodeAt(0)) + 1) % images.length],
        images[(Math.abs(listing._id.toString().charCodeAt(0)) + 2) % images.length]
      ],
      rating: generateRating(),
      reviewCount: Math.floor(Math.random() * 100) + 10,
      host: {
        name: "John Doe",
        joinedYear: 2019,
        isVerified: true,
        responseRate: "100%",
        isSuperhost: Math.random() > 0.5
      },
      amenities: [
        "WiFi", "Kitchen", "Air conditioning", "Heating", 
        "TV", "Washer", "Free parking", "Pool"
      ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 3),
      nearbyPlaces: [
        { name: "Beach", distance: "0.5 km" },
        { name: "Restaurant", distance: "0.2 km" },
        { name: "Market", distance: "1.0 km" },
        { name: "Airport", distance: "15 km" }
      ]
    };
    
    res.render("listings/show.ejs", { listing: enhancedListing });
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).send("Failed to load listing");
  }
});

// Create new listing
app.post("/listings", async (req, res) => {
  try {
    const listingData = req.body.listing;
    const newListing = new Listing(listingData);
    await newListing.save();
    console.log("✅ New listing created:", newListing.title);
    res.redirect("/listings");
  } catch (err) {
    console.error("❌ Error saving listing:", err);
    res.status(400).send("Failed to save listing: " + err.message);
  }
});

// Edit listing form
app.get("/listings/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.error("Error fetching listing for edit:", err);
    res.status(500).send("Failed to load listing");
  }
});

// Update listing
app.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(
      id, 
      req.body.listing,
      { new: true, runValidators: true }
    );
    
    if (!updatedListing) {
      return res.status(404).send("Listing not found");
    }
    
    console.log("✅ Listing updated:", updatedListing.title);
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(400).send("Failed to update listing: " + err.message);
  }
});

// Delete listing
app.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
      return res.status(404).send("Listing not found");
    }
    
    console.log("✅ Listing deleted:", deletedListing.title);
    res.redirect("/listings");
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).send("Failed to delete listing");
  }
});

// API Routes for AJAX requests
app.get("/api/listings", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API route for single listing
app.get("/api/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test routes (remove in production)
app.get("/test-images", (req, res) => {
  const imageList = images.map(img => 
    `<img src="${img}" style="width: 200px; margin: 10px; border-radius: 8px;" alt="test" />`
  ).join('');
  res.send(`<h2>Image Test</h2>${imageList}`);
});

app.get("/testListing", async (req, res) => {
  try {
    const sampleListing = new Listing({
      title: "My New Villa",
      description: "By the beach",
      price: 1200,
      location: "Calangute, Goa",
      country: "India",
      image: {
        url: "/images/beach-cottage.jpg",
        filename: "beach-cottage.jpg"
      }
    });

    await sampleListing.save();
    console.log("✅ Sample listing saved");
    res.send("Sample listing created successfully");
  } catch (err) {
    console.error("❌ Error creating sample:", err);
    res.status(500).send("Failed to create sample listing");
  }
});

// 404 handler - FIXED ROUTE DEFINITION
app.use((req, res) => {
  res.status(404).render("error", { 
    message: "Page not found",
    status: 404 
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT}/listings to view your app`);
});