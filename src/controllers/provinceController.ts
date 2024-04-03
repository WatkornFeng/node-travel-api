import { Response, Request, NextFunction } from "express";
import Province from "../models/provinceModel";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Hotel from "../models/hotelModel";
import { AppError } from "../utils/AppError";
import sharp from "sharp";
import { extend } from "slug";
interface IRequestUploadImage {
  uploadPicture: Buffer;
  uploadCover: Buffer;
}
declare global {
  namespace Express {
    interface Request extends IRequestUploadImage {}
  }
}
export const getAllProvinces = async (req: Request, res: Response) => {
  const provinces = await Province.find({}, "pictureCover.url name");
  // Delay FOR Test purpose
  const delayTime = 0;
  setTimeout(() => {
    res.status(200).json({
      status: "success",
      provinces,
    });
  }, delayTime);
};

export const getProvince = async (req: Request, res: Response) => {
  const id = req.params.provinceId;

  const provinces = await Province.findById(id);

  res.status(200).json({
    status: "success",
    provinces,
  });
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
  // console.log(province);
  if (province) return next(new AppError("Duplicate Field", 400, "fail"));
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const picture = files["picture"][0];
  const cover = files["cover"][0];
  // console.log(req.body.province);
  // console.log(province);
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

const uploadProvinceImage = async (imagePath: string[]) => {
  const options = {
    use_filename: true,
    folder: "Provinces",
    tags: ["Province"],
    overwrite: true,
  };

  try {
    // Upload the image
    let arrayResult = [];
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
  console.log(req.body);
  // const provinces = await Province.create({ _id });
  res.status(200).json({
    status: "success",
    // provinces,
  });
};
// export const deleteImageProvince = async (req: Request, res: Response) => {
//   const provinces = await Province.find({ _id });
//   res.status(200).json({
//     status: "success",
//     provinces,
//   });
// };

// W 2185 , H 1457 165 KB
// 1728 1296 200KB
// 3110 2073 190
// 2400 ,1600
