import express from "express";
import {
  getCheckoutSession,
  getMyBookings,
} from "../controllers/bookingController";

const bookingRouter = express.Router();

bookingRouter.route("/checkout-session/:hotelId").post(getCheckoutSession);
bookingRouter.route("/myBooking/:userId").get(getMyBookings);

export default bookingRouter;
