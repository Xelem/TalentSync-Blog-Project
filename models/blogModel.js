const mongoose = require("mongoose");
const Joi = require("joi");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please input blog title"],
    minLength: [8, "The title must have at least 8 characters"],
    maxLength: [255, "The title cannot have more than 255 characters"],
  },
  content: {
    type: String,
    required: [true, "Please input blog content"],
    minLength: [50, "There must be at least 50 characters in the blog content"],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please input blog author"],
  },
  timestamp: {
    type: Date,
    required: true,
    default: new Date(),
  },
  lastUpdated: Date,
});

blogSchema.pre("save", function () {
  this.lastUpdated = Date.now();
});

blogSchema.pre(/^find/, function () {
  this.populate({
    path: "author",
    select: "name",
  });
});

function validateBlog(blog) {
  const blogSchema = Joi.object({
    title: Joi.string().min(8).max(255).required(),
    content: Joi.string().min(50).required(),
    author: Joi.string().hex().length(24).required(),
  });

  return blogSchema.validate(blog);
}

const Blog = mongoose.model("Blog", blogSchema);
module.exports = { Blog, validateBlog };
