import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Hotel from "../models/hotelModel";
import { AppError } from "../utils/AppError";
import sharp from "sharp";
import mongoose from "mongoose";
import { getLocationFromLatLng } from "../utils/getLocation";
import Province from "../models/provinceModel";

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /**
     Thani?
     sort=PRICE_LOW_TO_HIGH
     &rating=Outstanding
     &star=5
     &property=Hotel
     &startDate=2024-02-11
     &endDate=2024-02-12
     &adults=1
     &children=0
     &rooms=1
    
    */
    const queryObj = { ...req.query };
    const placeParam = req.params.place;
    // console.log(queryObj);
    // console.log(placeParam);

    let query = Hotel.find(queryObj);

    // query location
    query = query.where({ location: placeParam });
    // query star
    if (queryObj.star) {
      // console.log(queryObj.star);
      query = query.where({ star: queryObj.star });
    }
    // query property
    if (queryObj.property) {
      query = query.where({ property: queryObj.property });
    }
    // query rating
    if (queryObj.rating === "Outstanding") query = query.gte("rating", 9);
    if (queryObj.rating === "Very Good") query = query.gte("rating", 8);
    if (queryObj.rating === "Good") query = query.gte("rating", 7);
    if (queryObj.rating === "Satisfactory") query = query.gte("rating", 6);
    if (queryObj.rating === "Any") query = query.gte("rating", 0);

    // SORT
    let sortBy = "price";
    if (queryObj.sort === "PRICE_LOW_TO_HIGH") {
      sortBy = "price";
    } else if (queryObj.sort === "PRICE_HIGH_TO_LOW") {
      sortBy = "-price";
    } else if (queryObj.sort === "RATING_HIGH_TO_LOW") {
      sortBy = "-rating";
    } else if (queryObj.sort === "RATING_LOW_TO_HIGH") {
      sortBy = "rating";
    }
    // console.log(sortBy);
    // console.log(query);
    query = query.sort(sortBy);

    const hotels = await query.exec();

    // Delay FOR Test purpose
    const delayTime = 500;

    setTimeout(() => {
      res.status(200).json({
        status: "success",
        data: {
          hotels,
        },
        length: hotels.length,
      });
    }, delayTime);
  } catch (err) {
    // res.status(500).json({
    //   status: "Error getting property",
    //   message: err,
    // });
    next(err);
  }
};

export const getHotelStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Hotel.aggregate([
      { $match: { star: { $gte: 1 } } },
      {
        $group: {
          _id: { $toUpper: "$location" },
          numHotels: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    // res.status(500).json({
    //   status: "Cal Stats Error",
    //   message: err,
    // });
    next(err);
  }
};
export const getHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, place } = req.params;

    // let query = Hotel.findById(id).populate({
    //   path: "province",
    //   select: "-picture -pictureCover -__v",
    // });
    let query = Hotel.findById(id).populate("reviews");

    const hotel = await query;

    if (!hotel) {
      return next(new AppError("No hotel with that ID", 404, "fail"));
    }

    // Delay FOR Test purpose
    const delayTime = 1000;

    setTimeout(() => {
      res.status(200).json({
        status: "success",
        data: {
          hotel,
        },
      });
    }, delayTime);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log(req.files);

    const ownerProperty = "65ec98feabff0b42e8e7c84a";
    const {
      propertyName: name,
      propertyDescription: description,
      propertyPrice: price,
      lnglat: coordinates,
      propertyAmenities: amenities,
      propertyStars: stars,
      propertyType,
      guests,
      beds,
    } = req.body;

    const [lng, lat] = JSON.parse(coordinates);
    // const lat = 37.09024;
    // const lng = -95.712891;

    const {
      address: { country_code, state },
    } = await getLocationFromLatLng(lat, lng);
    // console.log("lat", lat, "lng", lng);

    if (country_code !== "th") {
      return next(
        new AppError("Please select location in Thailand", 400, "fail")
      );
    }
    // state = "Nonthaburi Province"
    const province = state.replace("Province", "").trim();

    const provinceId = await Province.findOne({ name: province }).select("_id");
    // console.log("amen", amenities);
    // console.log(country_code);
    // console.log(state);

    const newHotel = await Hotel.create({
      name,
      description,
      price: JSON.parse(price),
      location: { coordinates: [lng, lat] },
      stars: JSON.parse(stars),
      guestsQuantity: JSON.parse(guests),
      bedsQuantity: JSON.parse(beds),
      province: provinceId,
      ownerProperty,
      propertyType,
      amenities,
      // images,
    });

    res.status(200).json({
      status: "success",
      // data: {
      //   hotel: newHotel,
      // },
    });
  } catch (err) {
    next(err);
  }
};
const uploadImage = async (imagePath: string) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    // unique_filename: true,
    folder: "Provinces",
    tags: ["Province"],
    overwrite: true,
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    // console.log(result);
    return result.public_id;
  } catch (error) {
    console.error(error);
  }
};

export const resizeImageHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.file);
  if (!req.file) return next(new AppError("Please select file", 400, "fail"));
  try {
    const resizeImageBuffer = await sharp(req.file.buffer)
      .resize(350, 350)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    req.file.buffer = resizeImageBuffer;

    next();
  } catch (error) {
    next(error);
  }
};

export const uploadImageHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const b64 = Buffer.from(req.file!.buffer).toString("base64");
    let dataURI = "data:" + req.file!.mimetype + ";base64," + b64;
    // console.log(dataURI);
    // upload to Cloudinary
    const results = await uploadImage(dataURI);
    // console.log(results);

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const newUpdatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        hotel: newUpdatedHotel,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent!",
    });
  }
};
export const getHotelWithin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    if (!lat || !lng) {
      return next(new AppError("Please provide lat,lng", 400, "fail"));
    }
    const radius = unit === "mi" ? +distance / 3963.2 : +distance / 6378.1;

    console.log(distance, lat, lng, unit);
    const hotels = await Hotel.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: "success",
      results: hotels.length,
      data: {
        hotels,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createNewHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //temp data
    req.body.user = "65d0d5639e5e821d43f476b7";
    const userId = req.body.user;
    console.log(req.body.user);
    const newHotel = await Hotel.create({
      ownerProperty: userId,
    });

    console.log(newHotel);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
};
