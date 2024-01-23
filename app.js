const express = require("express");
const morgan = require("morgan");
const blogRouter = require("./routes/blogRoutes");
const userRouter = require("./routes/userRoutes");
const { AppError, errorHandler } = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
