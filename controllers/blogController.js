const { Blog, validateBlog } = require("../models/blogModel");
const { catchAsyncError, AppError } = require("./errorController");

exports.createBlog = catchAsyncError(async (req, res, next) => {
  const blog = {
    title: req.body.title,
    content: req.body.content,
    author: req.user._id.toString(),
  };
  const { error } = validateBlog(blog);
  if (error) return next(new AppError(error.message, 400));

  const newBlog = await Blog.create(blog);

  res.status(201).json({
    status: "success",
    newBlog,
  });
});

exports.readBlog = catchAsyncError(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) return next(new AppError("Blog with this id not found", 404));

  res.status(200).json({
    status: "success",
    blog,
  });
});

exports.readAllBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await Blog.find();

  res.status(200).json({
    status: "success",
    length: blogs.length,
    blogs,
  });
});

exports.updateBlog = catchAsyncError(async (req, res, next) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!blog) return next(new AppError("Blog with this id not found", 404));

  res.status(200).json({
    status: "success",
    blog,
  });
});

exports.deleteBlog = catchAsyncError(async (req, res, next) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) return next(new AppError("Blog with this id not found", 404));

  res.status(204).json({
    status: "success",
    blog: null,
  });
});
