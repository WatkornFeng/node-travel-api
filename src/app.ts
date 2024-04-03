import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
// import { auth, requiresAuth } from "express-openid-connect";
import helmet from "helmet";
import { AppError } from "./utils/AppError";
import globalErrorHandler from "./controllers/errorController";
import cors from "cors";
// import cookieParser from "cookie-parser";
import hpp from "hpp";
import hotelRouter from "./routes/hotelRoutes";
import userRouter from "./routes/userRoutes";
import provincecRouter from "./routes/provinceRoutes";
import reviewRouter from "./routes/reviewRoutes";
import propertyTypeRouter from "./routes/propertyTypeRoutes";
import amenityRouter from "./routes/amenityRoutes";
import bookingRouter from "./routes/BookingRoutes";
import { webhookCheckout } from "./controllers/bookingController";
const app: Express = express();
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0_SECRET,
//   baseURL: process.env.AUTH0_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
// };

app.use(helmet());
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
// const limiter = rateLimit({
//   // 100 limit per hours in smae ip
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP,please try again in an hour",
// });
// app.use("/api", limiter);
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use(
  hpp({
    whitelist: ["star", "property"],
  })
);

app.use("/api/v1/hotels", hotelRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/provinces", provincecRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/propertyType", propertyTypeRouter);
app.use("/api/v1/amenity", amenityRouter);
app.use("/api/v1/booking", bookingRouter);
// app.use("/api/v1/auth");
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const message = `Can't find ${req.originalUrl} on this server. Please try again`;
  next(new AppError(message, 404, "fail"));
});

// Error handling middelware
app.use(globalErrorHandler);

export default app;
