import express, { Request, Response, NextFunction, Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";

import { webhookCheckout } from "./controllers/bookingController";
import globalErrorHandler from "./controllers/errorController";
import hotelRouter from "./routes/hotelRoutes";
import userRouter from "./routes/userRoutes";
import provincecRouter from "./routes/provinceRoutes";
import reviewRouter from "./routes/reviewRoutes";
import propertyTypeRouter from "./routes/propertyTypeRoutes";
import amenityRouter from "./routes/amenityRoutes";
import bookingRouter from "./routes/BookingRoutes";
import favoriteRouter from "./routes/favoriteRoutes";

import { AppError } from "./utils/AppError";

const app: Express = express();

app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/favorites", favoriteRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const message = `Can't find ${req.originalUrl} on this server. Please try again`;
  next(new AppError(message, 404, "fail"));
});

// Error handling middelware
app.use(globalErrorHandler);

export default app;
