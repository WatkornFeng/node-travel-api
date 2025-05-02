import { NextFunction, Request, Response } from "express";

import PropertyType from "../models/propertyTypeModel";
import { AppError } from "../utils/AppError";

export const getAllPropertyType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const types = await PropertyType.find().select("-__v -svg");

    if (!types.length)
      return next(new AppError("No amenities were found", 404, "fail"));

    res.status(200).json({
      status: "success",
      results: types.length,
      types,
    });
  } catch (error) {
    next(error);
  }
};

export const createPropertyType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const base64StringMain =
      "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkwMV8xMjA4KSI+DQo8cGF0aCBkPSJNMjEgMjhWMkMyMSAxLjQ0NyAyMC41NTMgMSAyMCAxSDJDMS40NDcgMSAxIDEuNDQ3IDEgMlYzMUg0VjE5SDE4VjMxSDMxVjE3SDI0VjNIMzFNOCAzMUgxNE04IDI3SDE0TTggMjNIMTRNMTEgN1YxM00zMSAxMUgyNE0yNyAxN1YxMU0zMCAxN1YxMU01IDEzSDE3VjdINVYxM1oiIHN0cm9rZT0iIzE0MkIyRmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPC9nPg0KPGRlZnM+DQo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkwMV8xMjA4Ij4NCjxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0id2hpdGUiLz4NCjwvY2xpcFBhdGg+DQo8L2RlZnM+DQo8L3N2Zz4=";
    const type = await PropertyType.create({
      name: "villa",
      svg: base64StringMain,
    });

    res.status(200).json({
      status: "success",
      data: {
        type,
      },
    });
  } catch (error) {
    next(error);
  }
};
