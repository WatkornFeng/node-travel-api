import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Favorite from "../models/favoriteModel";
import { AppError } from "../utils/AppError";

export const getMyFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.userId;

    const favorites = await Favorite.find({ user: userID })
      .select("hotel")
      .populate({
        path: "hotel",
        select:
          "name stars ratingsAverage ratingsQuantity images location slug propertyType province amenities _id price",
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
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

export const createFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.userId;
    const hotelID = req.body.hotelId;

    if (!userID || !hotelID) {
      return next(
        new AppError("Please specify user's id and hotel's id", 400, "fail")
      );
    }
    await Favorite.create({ user: userID, hotel: hotelID });

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.userId;
    const favoriteID = req.body.favoriteId;

    if (!userID || !favoriteID) {
      return next(
        new AppError("Please specify user's id and hotel's id", 400, "fail")
      );
    }
    if (!mongoose.Types.ObjectId.isValid(favoriteID)) {
      return next(new AppError("Invalid MongoDB I", 400, "fail"));
    }
    await Favorite.findOneAndDelete({ _id: favoriteID });

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
