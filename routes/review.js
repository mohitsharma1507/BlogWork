const express = require("express");
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../Schema.js");
const Review = require("../model/review.js");
const Blog = require("../model/Blog");
const wrapAsync = require("../utilies/wrapAsync.js");
const ExpressError = require("../utilies/ExpressError.js");
const { isReviewAuthor } = require("../middleware.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

// Post Review Route

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged first");
      return res.redirect("/login");
    }
    let blog = await Blog.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    blog.reviews.push(newReview);

    await newReview.save();
    await blog.save();

    res.redirect(`/blogs/${blog._id}`);
  })
);

// Delete Reviews Route
router.delete(
  "/:reviewId",
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Blog.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/blogs/${id}`);
  })
);

module.exports = router;
