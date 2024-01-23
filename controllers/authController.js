const jwt = require("jsonwebtoken");
const { catchAsyncError, AppError } = require("./errorController");

exports.verifyJwtToken = catchAsyncError(async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return next(new AppError("You are not logged in", 401));

  const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!user) return next(new AppError("You are not logged in", 401));
  console.log(user);
  req.user = user;
  next();
});
