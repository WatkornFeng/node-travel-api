import { NextFunction, Request, Response } from "express";
import Review from "../models/reviewModel";
import { AppError } from "../utils/AppError";

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let filter = {};

    if (req.params.hotelId) filter = { hotel: req.params.hotelId };

    const reviews = await Review.find(filter);

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
    if (!req.body.tour) req.body.hotel = req.params.hotelId;

    const review = await Review.create(req.body);

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

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return next(new AppError("No Review found", 404, "fail"));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return next(new AppError("No review found", 404, "fail"));
    }

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
