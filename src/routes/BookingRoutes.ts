import express from "express";
import {
  getCheckoutSession,
  getMyBookings,
} from "../controllers/bookingController";
import { attachUser, jwtCheck } from "../controllers/hotelController";

const bookingRouter = express.Router();

bookingRouter
  .route("/checkout-session/:hotelId")
  .post(jwtCheck, getCheckoutSession);

bookingRouter.route("/myBooking").get(jwtCheck, attachUser, getMyBookings);

export default bookingRouter;
