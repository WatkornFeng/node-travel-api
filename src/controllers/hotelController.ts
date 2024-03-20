import { Response, Request, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Hotel from "../models/hotelModel";
import { AppError } from "../utils/AppError";
import sharp from "sharp";

import { getLocationFromLatLng } from "../utils/getLocation";
import Province from "../models/provinceModel";
import { Types } from "mongoose";
import { DATA_URL_IMAGE_SCHEMA } from "./constant";

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
    let query = Hotel.findById(id)
      .populate("reviews")
      .populate("propertyType")
      .populate("province")
      .populate("ownerProperty")
      .populate("amenities");

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
    const imagesArrUrl = (req as any).imagesUrl;

    const ownerProperty = "65d0d5639e5e821d43f476b7";
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

    if (!coordinates) {
      return next(new AppError("Hotel must have location", 404, "fail"));
    }
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

    let amenityObjectIds;
    if (amenities) {
      const amenityIds = JSON.parse(amenities);
      amenityObjectIds = amenityIds.map((id: string) => new Types.ObjectId(id));
    }

    // console.log(country_code);
    // console.log(amenityObjectIds);
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
      amenities: amenityObjectIds,
      images: imagesArrUrl,
    });

    res.status(200).json({
      status: "success",
      data: {
        hotel: newHotel,
      },
    });
  } catch (err) {
    next(err);
  }
};
interface IImageUrl {
  url: string;
  cloudinary_id: string;
}
const uploadHotelImages = async (imagePath: string[]): Promise<IImageUrl[]> => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    folder: "Hotels",
    tags: ["Hotel"],
    overwrite: true,
  };

  let arrayResult = [];
  for (const image of imagePath) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      image,
      options
    );
    arrayResult.push({ url: secure_url, cloudinary_id: public_id });
  }
  return arrayResult;
};
const resizeImage = async (File: Buffer) => {
  return await sharp(File)
    .resize(350, 350)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
};
export const resizeHotelImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || Object.keys(files).length === 0)
    return next(
      new AppError("Please select images for your hotel ", 400, "fail")
    );
  if (files && files["pictures"].length < 5)
    return next(
      new AppError(
        "Please select at least 5 images for your hotel ",
        400,
        "fail"
      )
    );

  try {
    const fileImages = files["pictures"];
    const resizeImagesBuffer = await Promise.all(
      fileImages.map(async (file) => await resizeImage(file.buffer))
    );

    (req as any).resizedImagesBuffer = resizeImagesBuffer;
    next();
  } catch (error) {
    next(error);
  }
};
export const uploadHotelImagesToCloud = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imagesBase64Url = ((req as any).resizedImagesBuffer as Buffer[]).map(
      (buffer) => Buffer.from(buffer).toString("base64")
    );
    const imagesUrlString = imagesBase64Url.map(
      (img) => DATA_URL_IMAGE_SCHEMA + img
    );
    const results = await uploadHotelImages(imagesUrlString);

    (req as any).imagesUrl = results;
    next();
  } catch (err) {
    next(err);
  }
};
// export const uploadIHotelImagesToDB = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//   const imagesArrUrl = (req as any).imagesUrl

//     res.status(200).json({
//       status: "success",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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

// export const createNewHotel = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     //temp data
//     req.body.user = "65d0d5639e5e821d43f476b7";
//     const userId = req.body.user;
//     console.log(req.body.user);

//     const newHotel = await Hotel.create({
//       ownerProperty: userId,
//     });

//     console.log(newHotel);
//     res.status(200).json({
//       status: "success",
//     });
//   } catch (err) {
//     next(err);
//   }
// };
