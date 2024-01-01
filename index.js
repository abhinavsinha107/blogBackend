const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = 8000;
const authRoutes = require("./Routes/Auth");
const blogRoutes = require("./Routes/Blog");
const imageUploadRoutes = require("./Routes/imageUploadRoutes");


require("dotenv").config();
require("./db");
const cookieParser = require("cookie-parser");
const User = require("./Models/UserSchema");

app.use(bodyParser.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://blog-frontend-m2xqjfv5f-abhinav-sinhas-projects.vercel.app",
]; // Add more origins as needed
  
  // app.use(cors());
// Configure CORS with credentials
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials
  })
);

app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/image", imageUploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "The API is working" });
});

app.get('/blogcategories', async (req, res) => {
  const blogCategories = [
    "Technology Trends",
    "Health and Wellness",
    "Travel Destinations",
    "Food and Cooking",
    "Personal Finance",
    "Career Development",
    "Parenting Tips",
    "Self-Improvement",
    "Home Decor and DIY",
    "Book Reviews",
    "Environmental Sustainability",
    "Fitness and Exercise",
    "Movie and TV Show Reviews",
    "Entrepreneurship",
    "Mental Health",
    "Fashion and Style",
    "Hobby and Crafts",
    "Pet Care",
    "Education and Learning",
    "Sports and Recreation",
  ];
  res.json({
    message: "Categories fetched successfully",
    categories: blogCategories,
  });
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
