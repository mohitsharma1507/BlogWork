const Blog = require("./model/Blog");
const Review = require("./model/review");

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you don't have permission ");
    return res.redirect("/blogs");
  }
  next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/blogs/${id}`);
  }
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you did't create comments");
    return res.redirect(`/blogs/${id}`);
  }
  next();
};
