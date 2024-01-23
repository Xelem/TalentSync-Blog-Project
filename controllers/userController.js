const { User, validateUser } = require("../models/userModel");
const { catchAsyncError, AppError } = require("../controllers/errorController");
const _ = require("lodash");

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) return next(new AppError(error.message, 400));

  const { name, email, password, confirmPassword } = req.body;
  let user = await User.findOne({ email });
  if (user)
    return next(new AppError("This email has already been registered", 400));

  user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });
  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .status(201)
    .json({
      status: "success",
      user: _.pick(user, ["_id", "name", "email", "role"]),
    });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError("Incorrect email or password", 400));

  if ((await user.verifyPassword(password, user.password)) === false)
    return next(new AppError("Incorrect email or password", 400));

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .status(201)
    .json({
      status: "success",
      user: _.pick(user, ["_id", "name", "email", "role"]),
    });
});
