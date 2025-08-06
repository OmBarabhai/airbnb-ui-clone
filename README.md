# 🧭 Wanderlust – Airbnb-Style Listings App (Node.js + EJS)

A simple Airbnb-style app built with Node.js, Express, and MongoDB. Includes full CRUD functionality, RESTful routing, EJS templating, and basic styling. Features dynamic pages for creating, editing, viewing, and deleting listings. Includes sample data and organized folder structure for learning purposes.

Wanderlust is a full-stack web application inspired by Airbnb.  
Users can browse, create, edit, and delete listings of places to stay. Built with **Express.js**, **EJS templating**, and **MongoDB (optional)** using the MVC pattern.

---

## 📸 Screenshots

Here are some UI highlights from Wanderlust:

### 🏠 Home Page with Search + Navbar
![Home Page](public/images/ss1.png)

### 🏨 Listings on Home Page
![All Listings](public/images/ss2.png)

### 📄 Listing Details View
![Listing Detail](public/images/ss3.png)

### ✏️ Edit Listing Page
![Edit Listing](public/images/ss4.png)

### 🔍 Search Filter Results
![Search Listings](public/images/ss5.png)


---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Templating Engine:** EJS
- **Frontend:** HTML, CSS (custom)
- **Database:** MongoDB (optional or coming soon)
- **Layout Engine:** MVC (Models, Views, Controllers)

---

## ✨ Features

- 🏠 Browse all listings
- ➕ Create new listings
- ✏️ Edit existing listings
- ❌ Delete listings
- 🌐 Layout using EJS partials and boilerplates
- 🎨 Custom CSS styling
- 📁 Organized folder structure (MVC)

---
```
## 📁 Project Structure

wanderlust/                      # Root project directory
├── init/                        # Initial setup data
│   ├── data.js                  # Sample seed data for the database
│   └── index.js                 # Script to insert seed data
│
├── models/                      # Mongoose models
│   └── listing.js               # Schema for listings
│
├── public/                      # Publicly accessible static files
│   ├── css/                     # Stylesheets
│   │   └── style.css            # Custom global styles
│   └── images/                  # Images used in the site (listings, UI)
│
├── views/                       # EJS templates for rendering UI
│   ├── includes/                # Partial components
│   │   ├── footer.ejs           # Footer template
│   │   └── navbar.ejs           # Navbar template
│   ├── layouts/                 # Layout wrappers
│   │   └── boilerplate.ejs      # Base layout for all pages
│   └── listings/                # Pages related to listings
│       ├── edit.ejs             # Edit listing page
│       ├── index.ejs            # Listings home page
│       ├── new.ejs              # New listing form
│       └── show.ejs             # Individual listing detail
│
├── .gitignore                   # Files and folders Git should ignore
├── app.js                       # Main application entry point
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Exact dependency tree
└── README.md                    # Project documentation
```
## 🧪 How to Run the Project
1. **Clone the Repository**

   ```bash
   git clone https://github.com/OmBarabhai/wanderlust.git
   cd wanderlust
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Seed Sample Data (Optional)**
   If using MongoDB:

   ```bash
   node utils/seedDB.js
   ```

4. **Run the Application**

   ```bash
   node app.js
   ```

5. **Visit in Browser**

   ```
   http://localhost:8080/listings
   ```

---

## 📚 Learning Purpose

This project is designed for educational and practice purposes:

* Learn **full-stack development** using Node, Express, MongoDB, and EJS.
* Understand **MVC architecture**.
* Practice **RESTful routing** and **CRUD operations**.
* Structure large-scale projects with reusable code.

---

## 🚧 To-Do / Coming Soon

* ✅ Basic CRUD
* 🗂 MongoDB database integration
* 🔐 User authentication & authorization
* 🗺 Google Maps API for location
* 🖼 Cloudinary image uploads
* 📦 Deployment (Render / Vercel / Cyclic)

---

## 🙌 Acknowledgements

* Inspired by Airbnb’s listings design.
* Part of learning journey through full-stack projects and courses.