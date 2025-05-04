import { Response, Request, NextFunction } from "express";
import { Types } from "mongoose";

import sharp from "sharp";
import { auth } from "express-oauth2-jwt-bearer";
import { v2 as cloudinary } from "cloudinary";

import Hotel, { IHotel } from "../models/hotelModel";
import Province from "../models/provinceModel";
import User from "../models/userModel";
import PropertyType from "../models/propertyTypeModel";
import { AppError } from "../utils/AppError";
import { getLocationFromLatLng } from "../utils/getLocation";
import { DATA_URL_IMAGE_SCHEMA } from "./constant";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
// Step 1: Create JWT Check middleware
export const jwtCheck = auth({
  // change audience later
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Step 2: Create User fetching middleware
export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.auth?.payload["https://your-app.com/email"] as string;

    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return next(new AppError("Please login", 401, "fail"));
    }

    //Attach userId to request
    (req as any).userId = user._id;
    next();
  } catch (error) {
    next(error);
  }
};
export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawProvinceName = req.params.province; // e.g. "Amnat%20Charoen"
    const decodedName = decodeURIComponent(rawProvinceName).trim(); // e.g. "Amnat Charoen"

    const provinceID = await Province.findOne({
      //for exact match
      $expr: {
        //case-insensitive match
        $eq: [{ $toLower: "$name" }, decodedName.toLowerCase()],
      },
    }).select("_id");

    //----------SORT BY PRICE & BY RATING AVERAGE------------///
    const sortOption = req.query.sort as string | undefined;

    let sortBy: { price?: 1 | -1; ratingsAverage?: 1 | -1 } = {};

    switch (sortOption) {
      case "PRICE_LOW_TO_HIGH":
        sortBy = { price: 1 };
        break;
      case "PRICE_HIGH_TO_LOW":
        sortBy = { price: -1 };
        break;
      case "RATING_HIGH_TO_LOW":
        sortBy = { ratingsAverage: -1 };
        break;
      case "RATING_LOW_TO_HIGH":
        sortBy = { ratingsAverage: 1 };
        break;
      default:
        // If undefined or invalid, use default sort
        sortBy = { price: 1 };
    }

    //----------QUERY RANGE OF RATING AVERAGE------------///
    const rating = req.query.rating;

    // Initialize query filter for ratingsAverage
    let ratingsFilter: any = {};

    // Map the rating categories to their ranges
    if (rating === "Outstanding") {
      ratingsFilter.ratingsAverage = { $gte: 9 }; // Ratings between 9 and 10 (max 10 is implied)
    } else if (rating === "Very Good") {
      ratingsFilter.ratingsAverage = { $gte: 8 }; // Ratings between 8 and 10
    } else if (rating === "Good") {
      ratingsFilter.ratingsAverage = { $gte: 7 }; // Ratings between 7 and 10
    } else if (rating === "Satisfactory") {
      ratingsFilter.ratingsAverage = { $gte: 6 }; // Ratings between 6 and 10
    } else if (rating === "Any" || !rating) {
      ratingsFilter.ratingsAverage = { $gte: 0 }; // Default range: Any (all ratings between 0 and 10)
    }
    //-------------QUERY BY STAR----------------///
    const star = req.query.star as string[] | undefined | string; // ['5','4'] | undefined | 5

    let starsFilter: any = {}; // Initialize the stars filter object

    if (star) {
      // Check if star is an array or a single value
      const rawStars = Array.isArray(star) ? star : [star];
      const starsArray = rawStars.filter(
        (s): s is string => typeof s === "string"
      );
      // Convert to numbers and filter out invalid values
      const validStars = starsArray
        .map((s: string) => parseInt(s, 10))
        .filter((s: number) => s >= 1 && s <= 5); // Only valid stars will be included

      // If there are valid stars, apply the filter
      if (validStars.length > 0) {
        starsFilter.stars = { $in: validStars };
      }
    }

    //-------------QUERY BY PROPERTY----------------///

    const property = req.query.property;

    let propertyTypeFilter: any = {};

    if (property) {
      const namesArray = Array.isArray(property) ? property : [property];
      const lowercased = namesArray
        .filter((name): name is string => typeof name === "string")
        .map((name) => name.toLowerCase());
      propertyTypeFilter.name = {
        $in: lowercased,
      };
    }
    ////////////////// FIND ID OF PROPERTY
    const propertiesID = await PropertyType.find(propertyTypeFilter).distinct(
      "_id"
    );

    const hotels = await Hotel.find({
      province: provinceID,
      ...ratingsFilter,
      ...starsFilter,
      propertyType: {
        $in: propertiesID,
      },
    })
      .sort(sortBy)
      .select("_id stars ratingsAverage ratingsQuantity price name images slug")
      .populate("province", "name")
      .populate("propertyType", "name svg")
      .populate("amenities", "name svg");

    res.status(200).json({
      status: "success",
      data: {
        hotels,
      },
      length: hotels.length,
    });
  } catch (err) {
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
    next(err);
  }
};

export const getHotelStatsOnUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Hotel.aggregate([
      { $match: { ownerProperty: new Types.ObjectId(req.params.userId) } },
      {
        $group: {
          _id: "$ownerProperty",
          totalHotels: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getMyHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId } = req.params;

    let query = Hotel.findById(
      hotelId,
      "-images._id -images.id -images.cloudinary_id -__v -slug -province"
    )
      .populate({ path: "amenities", select: "name svg -_id" })
      .populate({ path: "propertyType", select: "name svg -_id" })
      .populate({ path: "ownerProperty", select: "name locale -_id" })
      .populate("reviews");

    const hotel = await query;

    if (!hotel) {
      return next(new AppError("No hotel with that ID", 404, "fail"));
    }

    res.status(200).json({
      status: "success",
      data: {
        hotel,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelID = req.params.hotelID;
    const provinceName = req.params.provinceName;

    const province = await Province.findOne({ name: provinceName });

    if (!province) {
      return res.status(200).json({
        status: "success",
        data: null,
      });
    }

    let query = Hotel.findById(
      hotelID,
      "-images._id -images.id -images.cloudinary_id -__v -slug -province"
    )
      .populate({ path: "amenities", select: "name svg -_id" })
      .populate({ path: "propertyType", select: "name svg -_id" })
      .populate({ path: "ownerProperty", select: "name locale -_id" })
      .populate("reviews");

    const hotel = await query;

    if (!hotel) {
      return next(new AppError("No hotel with that ID", 404, "fail"));
    }

    res.status(200).json({
      status: "success",
      data: {
        hotel,
      },
    });
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
    const imagesUrlString = (req as any).imagesUrl;
    const ownerProperty = req.userId;

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

    const {
      address: { country_code, province: provinceData, city },
    } = await getLocationFromLatLng(lat, lng);

    if (country_code !== "th") {
      return next(
        new AppError("Please select location in Thailand", 400, "fail")
      );
    }

    const province = provinceData
      ? provinceData.replace("Province", "").trim()
      : city;

    const normalized = (str: string) => str.replace(/\s+/g, "").toLowerCase();
    const normalizedProvince = normalized(province);
    const provinceId = await Province.findOne({
      $expr: {
        $eq: [
          {
            $toLower: {
              $replaceAll: { input: "$name", find: " ", replacement: "" },
            },
          },
          normalizedProvince, // Direct exact match after transformation
        ],
      },
    }).select("_id");

    if (!provinceId) {
      return next(new AppError("Couldn't find your location", 400, "fail"));
    }

    let amenityObjectIds;
    if (amenities) {
      const amenityIds = JSON.parse(amenities);
      amenityObjectIds = amenityIds.map((id: string) => new Types.ObjectId(id));
    }

    const imagesArrUrl = await uploadHotelImages(imagesUrlString);

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

  const arrayResult: IImageUrl[] = [];

  for (const image of imagePath) {
    try {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image,
        options
      );
      arrayResult.push({ url: secure_url, cloudinary_id: public_id });
    } catch (error) {
      throw new Error(`Failed to upload image: ${image}`);
    }
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
export const imageBufferToString = async (
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

    (req as any).imagesUrl = imagesUrlString;
    next();
  } catch (err) {
    next(err);
  }
};

export const getHotelsOnUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let filter = {};

    if (req.params.userId) filter = { ownerProperty: req.params.userId };

    const hotels = await Hotel.find(filter)
      .select("name guestsQuantity ratingsAverage price")
      .populate({ path: "propertyType", select: "name -_id" });

    res.status(200).json({
      status: "success",
      data: { hotels },
      length: hotels.length,
    });
  } catch (err) {
    next(err);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newUpdatedHotel = await Hotel.findByIdAndUpdate(
      req.params.hotelId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!newUpdatedHotel) {
      return next(new AppError("No hotel found with that ID", 404, "fail"));
    }

    res.status(200).json({
      status: "success",
      data: {
        hotel: newUpdatedHotel,
      },
    });
  } catch (err) {
    next(err);
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

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelID = req.params.hotelId;

    const hotel: IHotel | null = await Hotel.findById(hotelID);

    if (!hotel) {
      return next(new AppError("No hotel found with that ID", 404, "fail"));
    }
    const imgId = hotel.images.map((img) => img.cloudinary_id);

    await cloudinary.api.delete_resources(imgId);

    const deletedHotel = await Hotel.findByIdAndDelete(hotel._id);
    if (!deletedHotel) {
      return next(new AppError("No hotel found with that ID", 404, "fail"));
    }
    const delaytime = 1000;
    setTimeout(() => {
      res.status(200).json({
        status: "success",
        message: `Delete ${deletedHotel.name} successfully.`,
      });
    }, delaytime);
  } catch (err) {
    next(err);
  }
};
