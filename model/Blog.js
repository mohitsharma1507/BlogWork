const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: String,
    filename: String,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

blogSchema.post("findOneAndDelete", async (blog) => {
  if (blog) {
    await Review.deleteMany({ Reviews: { $in: blog.reviews } });
  }
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
