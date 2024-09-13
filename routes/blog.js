const express = require("express");
const app = express();
const router = express.Router();
const Blog = require("../model/Blog");
const wrapAsync = require("../utilies/wrapAsync.js");
const { isOwner } = require("../middleware");
const { blogSchema } = require("../Schema.js");
const multer = require("multer");

const ExpressError = require("../utilies/ExpressError.js");
const { storage } = require("../cloudinaryConfig.js");
const upload = multer({ storage });

const validateBlogs = (req, res, next) => {
  let { error } = blogSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

//Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("blogs/index.ejs", { allBlogs });
  })
);

// New Route
router.get("/new", (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged first");
    return res.redirect("/login");
  }
  res.render("blogs/new.ejs");
});

// Show Route

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const blog = await Blog.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged first");
      return res.redirect("/login");
    }
    res.render("blogs/show.ejs", { blog });
  })
);

// Create Route

router.post(
  "/",
  upload.single("blog[image]"),
  validateBlogs,
  wrapAsync(async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged first");
      return res.redirect("/login");
    }
    let url = req.file.path;
    let filename = req.file.filename;
    const newBlog = new Blog(req.body.blog);
    newBlog.owner = req.user._id;
    newBlog.image = { url, filename };
    let savedBlog = await newBlog.save();
    console.log(savedBlog);

    req.flash("success", "New Blog Created!");
    res.redirect("/blogs");
  })
);

// Edit Route

router.get(
  "/:id/edit",
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      req.flash("error", "blog you requested for doesnot exist");
      return res.redirect("/blogs");
    }

    let originalImageUrl = blog.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_150");
    res.render("blogs/edit.ejs", { blog, originalImageUrl });
  })
);

// Update Route

router.put(
  "/:id",
  isOwner,
  upload.single("blog[image]"),
  (req, res, next) => {
    console.log(req.body); // Log the request body
    next();
  },
  validateBlogs,
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged first");
      return res.redirect("/login");
    }
    let { id } = req.params;
    let blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      blog.image = { url, filename };
      await blog.save();
    }
    res.redirect(`/blogs/${id}`);
  })
);

// Delete Route
router.delete(
  "/:id",
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedBlog = await Blog.findByIdAndDelete(id);
    console.log(deletedBlog);
    req.flash("success", "Listing deleted");
    res.redirect("/blogs");
  })
);

module.exports = router;
