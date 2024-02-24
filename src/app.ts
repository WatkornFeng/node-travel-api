import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
// import { auth, requiresAuth } from "express-openid-connect";

import hotelRouter from "./routes/hotelRoutes";
import { AppError } from "./utils/AppError";
import globalErrorHandler from "./controllers/errorController";
import cors from "cors";
// import cookieParser from "cookie-parser";

import userRouter from "./routes/userRoutes";
const app: Express = express();
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0_SECRET,
//   baseURL: process.env.AUTH0_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
// };

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(function (req, res, next) {
//   console.log("req");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   next();
// });
// app.use(cors({ origin: "http://localhost:5173" }));
app.use(cors());
app.use(express.json());
// app.use(cookieParser());
// app.use(auth(config));

app.use("/api/v1/hotels", hotelRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/auth");
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const message = `Can't find ${req.originalUrl} on this server. Please try again`;
  next(new AppError(message, 404, "fail"));
});

// Error handling middelware
app.use(globalErrorHandler);

export default app;
