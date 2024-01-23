const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});

if (process.env.NODE_ENV === "development") {
  mongoose
    .connect(process.env.DB_CONN_STRING_DEV)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));
} else if (process.env.NODE_ENV === "production") {
  const DB = process.env.DB_CONN_STRING_PROD.replace(
    "<password>",
    process.env.DB_PASSWORD
  );

  mongoose
    .connect(DB)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));
}

const app = require("./app");
const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
