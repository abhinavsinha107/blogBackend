const express = require("express");
const router = express.Router();
const Blog = require("../Models/BlogSchema");
const User = require("../Models/UserSchema");
const authTokenHandler = require("../Middlewares/checkAuthToken");
const jwt = require("jsonwebtoken");

const checkBlogOwnership = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    if (blog.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Permission denied: You do not own this blog" });
    }

    req.blog = blog;
    next();
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// CRUD + seach operations

router.get("/test", authTokenHandler, async (req, res) => {
  res.json({
    message: "Test API works for blogs",
    userId: req.userId,
  });
});

// Create a new blog post
router.post("/", authTokenHandler, async (req, res) => {
  try {
    const { title, description, imageUrl, paragraphs } = req.body;
    const blog = new Blog({
      title,
      description,
      imageUrl,
      paragraphs,
      owner: req.userId,
    });
    await blog.save();

    // Add the blog post to the user's blogs array
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.blogs.push(blog._id);
    await user.save();
    res.status(201).json({
      message: "Blog post created successfully",
      blog,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get a specific blog post by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Update a specific blog post by ID
router.put("/:id", authTokenHandler, checkBlogOwnership, async (req, res) => {
  try {
    const { title, description, imageUrl, paragraphs } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, paragraphs },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      message: "Blog post updated successfully",
      updatedBlog,
    });
  } catch (err) {
    res.status(500).json(createResponse(false, err.message));
  }
});

// Delete a specific blog post by ID
router.delete(
  "/:id",
  authTokenHandler,
  checkBlogOwnership,
  async (req, res) => {
    try {
      // Find the blog post by ID and delete it
      const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

      if (!deletedBlog) {
        return res.status(404).json({
          message: "Blog post not found",
        });
      }

      // Remove the deleted blog ID from the user's blogs array
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.blogs.pull(req.params.id);
      await user.save();

      res.status(200).json({
        message: "Blog post deleted successfully",
        deletedBlog,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// Search
router.get("/", async (req, res) => {
  try {
    const search = req.body.search || "";
    const page = parseInt(req.body.page) || 1;
    const perPage = 2;

    // Build the search query using regular expressions for case-insensitive search
    const searchQuery = new RegExp(search, "i");

    const totalBlogs = await Blog.countDocuments({ title: searchQuery });
    const totalPages = Math.ceil(totalBlogs / perPage);

    if (page < 1 || page > totalPages) {
      return res.status(400).json({
        message: "Invalid page number",
      });
    }

    // Calculate the number of blogs to skip
    const skip = (page - 1) * perPage;

    const blogs = await Blog.find({ title: searchQuery })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      blogs,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
