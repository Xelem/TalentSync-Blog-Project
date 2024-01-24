class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode.toString().startsWith("4") ? "fail" : "error"}`;
    console.log("status", this.status);
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleDuplicateErrorDb = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDb = (error, res) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  console.log(error);
  const message = `Invalid input data. ${errors.join(". ")}`;
  console.log("in ehre too");
  console.log(message);
  return res.status(400).json({
    status: "fail",
    message,
  });
};

const handleCastErrorDb = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const catchAsyncError = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log({ error });

    if (error.name === "CastError") {
      error = handleCastErrorDb(error);
    } else if (error.code === 11000) {
      error = handleDuplicateErrorDb(error);
    } else if (error._message === "Validation failed") {
      err = handleValidationErrorDb(err, res);
    } else {
      sendErrorProd(error, res);
    }
  }
};

module.exports = { AppError, errorHandler, catchAsyncError };
