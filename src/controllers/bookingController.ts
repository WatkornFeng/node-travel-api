import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Hotel from "../models/hotelModel";
import Booking from "../models/bookingModel";
import User from "../models/userModel";
import { AppError } from "../utils/AppError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.auth?.payload["https://your-app.com/email"] as string;
    const { cancelUrl } = req.body;
    const hotel = await Hotel.findById(req.params.hotelId).populate({
      path: "province",
      select: "name",
    });
    if (!hotel) {
      return next(new AppError("No hotel with that ID", 404, "fail"));
    }
    const user = await User.findOne({ _id: req.params.email }).select(
      "_id name"
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}${cancelUrl}`,
      customer_email: email,
      client_reference_id: req.params.hotelId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: (hotel.price as number) * 100,
            product_data: {
              name: hotel.name as string,
              description: hotel.description as string,
              images: [hotel.images[0].url],
            },
          },
        },
      ],
    });

    res.status(200).json({
      status: "success",
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate({
      path: "hotel",
      select:
        "name stars ratingsAverage ratingsQuantity images location slug propertyType province amenities _id",
      populate: [
        {
          path: "propertyType",
          select: "name svg",
        },
        { path: "province", select: "name" },
        { path: "amenities", select: "name svg" },
      ],
    });

    res.status(200).json({
      status: "success",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
// After Stripe payment already successful.
export const webhookCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let event;

  try {
    const signature = req.headers["stripe-signature"] as string | string[];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    return res.status(400).send(`Webhook error:${(error as any).message}`);
  }

  if (event.type === "checkout.session.completed")
    await createBookingCheckout(event.data.object);

  res.status(200).json({ recieved: true });
};
// create booking into DB
export const createBookingCheckout = async (
  session: Stripe.Checkout.Session
) => {
  const hotel = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))?._id;
  const isPaid = session.payment_status === "paid" ? true : false;

  const price = (session.amount_total as number) / 100;

  await Booking.create({ hotel, user, price, isPaid });
};
