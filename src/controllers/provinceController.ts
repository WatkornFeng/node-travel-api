import { Response, Request } from "express";
import Province from "../models/provinceModel";
export const getProvinces = async (req: Request, res: Response) => {
  const provinces = await Province.find();
  res.status(200).json({
    status: "success",
    provinces,
  });
};
