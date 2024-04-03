import { NextFunction, Response, Request } from "express";
import Hotel, { IHotel } from "../models/hotelModel";
import Stripe from "stripe";
import { AppError } from "../utils/AppError";
import Booking from "../models/bookingModel";
import User from "../models/userModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cancelUrl } = req.body;
    const hotel = await Hotel.findById(req.params.hotelId).populate({
      path: "province",
      select: "name",
    });
    if (!hotel) {
      return next(new AppError("No hotel with that ID", 404, "fail"));
    }
    // console.log(hotel);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}${cancelUrl}`,
      customer_email: "customer_0001@gmail.com",
      client_reference_id: req.params.hotelId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: (hotel.price as number) * 100,
            product_data: {
              //metedata for our object value beside default
              // metadata:{}
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
// create booking into DB
export const createBookingCheckout = async (
  session: Stripe.Checkout.Session
) => {
  // console.log("session", session);
  const hotel = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))?._id;

  const price = (session.amount_total as number) / 100;
  // console.log(hotel, user, price);
  await Booking.create({ hotel, user, price });
};
export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate({
      path: "hotel",
      select: "name stars ratingsAverage ratingsQuantity",
    });
    // console.log(bookings);
    // const hotelIDs = bookings.map((booking) => booking.hotel);
    // console.log(hotelIDs);
    // const hotels = await Hotel.find({ _id: { $in: hotelIDs } });
    // console.log(hotels);
    const delayTime = 1000;
    setTimeout(() => {
      res.status(200).json({
        status: "success",
        data: bookings,
      });
    }, delayTime);
  } catch (error) {
    next(error);
  }
};
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
