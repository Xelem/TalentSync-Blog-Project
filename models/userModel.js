const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please input your name"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Please input your email"],
  },
  password: {
    type: String,
    required: [true, "Please input your password"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

userSchema.methods.verifyPassword = async function (
  currentPassword,
  currentHash
) {
  return await bcrypt.compare(currentPassword, currentHash);
};

function validateUser(user) {
  const userSchema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-z0-9]{8,100}$"))
      .trim()
      .required(),
    confirmPassword: Joi.ref("password"),
  });

  return userSchema.validate(user);
}

const User = mongoose.model("User", userSchema);
module.exports = { User, validateUser };
