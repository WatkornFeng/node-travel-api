import { NextFunction, Request, Response } from "express";
import Review from "../models/reviewModel";

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find();
    console.log(reviews);
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const {} = req.body;
    const review = await Review.create(req.body);
    console.log(review);
    res.status(200).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};
