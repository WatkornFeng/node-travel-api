import type { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import Province from "../models/provinceModel";
import { AppError } from "../utils/AppError";
import Hotel from "../models/hotelModel";

interface IRequestUploadImage {
  uploadPicture: Buffer;
  uploadCover: Buffer;
}
// declare global {
//   namespace Express {
//     interface Request extends IRequestUploadImage {}
//   }
// }
export const getAllProvinces = async (req: Request, res: Response) => {
  const provinces = await Province.find({}, "name -_id");

  res.status(200).json({
    status: "success",
    provinces,
  });
};

export const getSixProvinces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const randomSixProvinces = await Province.aggregate([
      { $sample: { size: 6 } },
      {
        $project: {
          _id: 1,
          name: 1,
          picture: 1,
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      provinces: randomSixProvinces,
    });
  } catch (error) {
    next(error);
  }
};
export const getProvince = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawProvinceName = req.params.provinceName; // e.g. "Amnat%20Charoen"
    const decodedName = decodeURIComponent(rawProvinceName); // e.g. "Amnat Charoen"
    const province = await Province.findOne({
      name: { $regex: new RegExp(decodedName, "i") }, // 'i' for case-insensitive search + not exact match
    }).select("name pictureCover _id");
    const countHotel = await Hotel.countDocuments({ province: province?._id });

    res.status(200).json({
      status: "success",
      province,
      countHotel,
    });
  } catch (error) {
    next(error);
  }
};

const resizeImg = async (File: Buffer, size: number[], quality: number) => {
  return await sharp(File)
    .resize(size[0], size[1])
    .toFormat("jpeg")
    .jpeg({ quality })
    .toBuffer();
};

export const resizeProvincesImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provinceName = req.body.province;
  const province = await Province.findOne().where({ name: provinceName });

  if (province) return next(new AppError("Duplicate Field", 400, "fail"));
  const files = req.files;
  const picture = files && files["picture"][0];
  const cover = files && files["cover"][0];

  if (!picture || !cover)
    return next(
      new AppError("Please select picture and cover file", 400, "fail")
    );

  try {
    const bufferPicture = await resizeImg(picture.buffer, [350, 350], 90);
    const bufferCover = await resizeImg(cover.buffer, [2200, 1500], 30);
    req.uploadPicture = bufferPicture;
    req.uploadCover = bufferCover;

    next();
  } catch (error) {
    next(error);
  }
};
interface IUploadImageResult {
  picture: {
    secure_url: string;
    public_id: string;
  };
  pictureCover: {
    secure_url: string;
    public_id: string;
  };
  err: Error;
}
interface ImageResult {
  secure_url: string;
  public_id: string;
}
const uploadProvinceImage = async (imagePath: string[]) => {
  const options = {
    use_filename: true,
    folder: "Provinces",
    tags: ["Province"],
    overwrite: true,
  };

  try {
    // Upload the image
    let arrayResult: ImageResult[] = [];
    for (const image of imagePath) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image,
        options
      );
      arrayResult.push({ secure_url, public_id });
    }
    return { picture: arrayResult[0], pictureCover: arrayResult[1] };
  } catch (error) {
    return error;
  }
};

export const uploadProvinceImageToDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const provinceName = req.body.province;

    const b64Cover = Buffer.from(req.uploadCover).toString("base64");
    const b64Picture = Buffer.from(req.uploadPicture).toString("base64");

    let dataURLCover = "data:" + "image/jpeg" + ";base64," + b64Cover;
    let dataURLPicture = "data:" + "image/jpeg" + ";base64," + b64Picture;

    const arrayOfDataURL = [dataURLPicture, dataURLCover];
    const {
      picture: { secure_url: pictureUrl, public_id: pictureId },
      pictureCover: { secure_url: coverUrl, public_id: coverId },
      err,
    } = (await uploadProvinceImage(arrayOfDataURL)) as IUploadImageResult;
    if (err) {
      return next(new AppError("upload images to Cloud Error", 500, "fail"));
    }
    const province = await Province.create({
      name: provinceName,
      picture: { url: pictureUrl, cloudinary_id: pictureId },
      pictureCover: { url: coverUrl, cloudinary_id: coverId },
    });
    res.status(200).json({
      status: "success",
      province,
    });
  } catch (error) {
    next(error);
  }
};
export const createProvince = async (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
  });
};
