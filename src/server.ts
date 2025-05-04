import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
// handle error in synchronus code which were not handled before EX. in case variable undefined
process.on("uncaughtException", (err: any) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.mesage);
  process.exit(1);
});
dotenv.config(); // Load environment variables from .env file
import app from "./app";

const DB = process.env.DATABASE!.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD!
);
mongoose
  .connect(DB)
  .then(() => console.log("DB connection established"))
  .catch((error) => console.log(error.message));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// handle error in async code which were not handled before
// EX. in case lost of connection from DB
process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.mesage);
  server.close(() => {
    //process.exit(0) >indicates that the process completed successfully without encountering any errors.
    //process.exit(1) >indicates that the process terminated due to an error or failure

    process.exit(1);
  });

  // should have tool for restarting server after crashed
});
