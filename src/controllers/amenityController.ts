import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { AppError } from "../utils/AppError";
import PropertyType from "../models/propertyTypeModel";
import Amenity from "../models/amenityModel";

export const getAllAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const amenities = await Amenity.find().select("-__V");
    if (!amenities.length)
      return next(new AppError("No amenities were found", 404, "fail"));
    // Delay FOR Test purpose
    const delayTime = 1000;

    setTimeout(() => {
      res.status(200).json({
        status: "success",
        results: amenities.length,
        data: {
          amenities,
        },
      });
    }, delayTime);
  } catch (error) {
    next(error);
  }
};

export const createAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const base64StringMain =
      "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMjEgNy41QzIxIDguODgwNzEgMTkuODgwNyAxMCAxOC41IDEwQzE3LjExOTMgMTAgMTYgOC44ODA3MSAxNiA3LjVDMTYgNi4xMTkyOSAxNy4xMTkzIDUgMTguNSA1QzE5Ljg4MDcgNSAyMSA2LjExOTI5IDIxIDcuNVoiIGZpbGw9IiMxNDJCMkZmZiIvPg0KPHBhdGggZD0iTTE5Ljc1NCAxMy4xMjgzTDEyLjM1NCA2Ljk2MTY5QzEwLjkwOTUgNS43NTc5NCA4LjkxMTggNS40NjYzOCA3LjE4MzUxIDYuMjA3MDhMMy41OTIyMiA3Ljc0NjJDMy4yMzI5NCA3LjkwMDE3IDMgOC4yNTM0NCAzIDguNjQ0MzJDMyA5LjMxMTI2IDMuNjUzNCA5Ljc4MjIxIDQuMjg2MTIgOS41NzEzTDcuODI3MzYgOC4zOTA4OUM4LjU0NjAzIDguMTUxMzMgOS4zMzgzNyA4LjMzODM4IDkuODc0MDMgOC44NzQwNEwxMSAxMEw1LjcyOTczIDEzLjI5MzlDNS44NzE1NyAxMy4zNzgyIDYuMDAwODggMTMuNDc4MyA2LjExODQyIDEzLjU5MTFDNi40Mjc5OSAxMy44ODgzIDYuNjUxMzcgMTQuMjg2NSA2Ljc2NjA3IDE0LjQ3QzYuOTg1MjEgMTQuODIwNiA3LjE3MjUzIDE1IDcuNjA1NTcgMTVDOC4zNjQ2OSAxNSA5LjAxMDUyIDE0LjUyODYgOS42MTUzMyAxNC4xMjQ5QzEwLjMyNzYgMTMuNjQ5MyAxMS4yOTk4IDEzIDEyLjYwNTYgMTNDMTMuMjg1MSAxMyAxMy44NDcyIDEzLjE3NTggMTQuMjg3NiAxMy41NTMzQzE0LjY2MzQgMTMuODc1MyAxNC44Njc1IDE0LjI4NjMgMTQuOTgxOCAxNC41MTYyQzE1LjE0ODUgMTQuODUxMSAxNS4yMDczIDE1IDE1LjYwNTYgMTVDMTYuMjg3NyAxNSAxNi45MzgzIDE0LjY1OTUgMTcuNzY5IDE0LjE0ODRDMTguMTgzOSAxMy44OTMgMTguNTk0OCAxMy42MjkgMTkuMDMyOSAxMy40MTQ0QzE5LjI1MjYgMTMuMzA2OSAxOS40OTQyIDEzLjIwNDQgMTkuNzU0IDEzLjEyODNaIiBmaWxsPSIjMTQyQjJGZmYiLz4NCjxwYXRoIGQ9Ik0yMy40NDcyIDE4Ljg5NDRDMjIuOTUzNiAxOS4xNDEzIDIyLjM1MzQgMTguOTQxNSAyMi4xMDYxIDE4LjQ0ODJDMjEuOTU3NSAxOC4xNjUzIDIxLjc3IDE3Ljg5ODYgMjEuNTU5OSAxNy42NTg1QzIxLjE3NDcgMTcuMjE4MyAyMC44MDM2IDE3IDIwLjUgMTdDMjAuMzQzNCAxNyAyMC4xMjggMTcuMDUzNCAxOS44MDcxIDE3LjIxMDZDMTkuNDI3IDE3LjM5NjcgMTkuMDcxMyAxNy42Mjk2IDE4LjcxMTYgMTcuODUxN0MxNy45MTczIDE4LjM0MDUgMTYuODE3OCAxOSAxNS41IDE5QzE0LjgyMDUgMTkgMTQuMjU4NCAxOC44MjQyIDEzLjgxOCAxOC40NDY4QzEzLjQ5OTYgMTguMTczOSAxMy4yOSAxNy44MTc2IDEzLjEwNTYgMTcuNDQ3MkMxMi45NTAxIDE3LjEzNjMgMTIuODU3MSAxNyAxMi41IDE3QzExLjc0MDkgMTcgMTEuMDk1MSAxNy40NzE0IDEwLjQ5MDIgMTcuODc1MUM5Ljc3Nzk3IDE4LjM1MDggOC44MDU4IDE5IDcuNSAxOUM2LjgxODI1IDE5IDYuMjYxNDcgMTguODI0NCA1LjgxMDI3IDE4LjQ5NjJDNS4zODU0NiAxOC4xODczIDUuMTI4NzcgMTcuNzkyOCA0Ljk2NDUgMTcuNTNDNC42MzU1NyAxNy4wMDIyIDQuMzEwNTcgMTYuOTUxNyAzLjc0NjExIDE3LjIxNzNDMy40MjM3OSAxNy4zNjkgMy4wODg5NCAxNy41ODA5IDIuNzc1NjcgMTcuODA4N0MyLjQwMDIgMTguMDgxOCAyLjAzNzQ0IDE4LjM4MDYgMS43MDY4NyAxOC43MDczQzEuMzE2MzEgMTkuMDk3NCAwLjY4MzI3IDE5LjA5NzUgMC4yOTI4OTMgMTguNzA3MUMtMC4wOTc2MzExIDE4LjMxNjYgLTAuMDk3NjMxMSAxNy42ODM0IDAuMjkyODkzIDE3LjI5MjlDMC42OTY2NDkgMTYuODkyIDEuMTM5NjYgMTYuNTI1NiAxLjU5OTMzIDE2LjE5MTNDMS45NzM1NiAxNS45MTkxIDIuNDE5OTYgMTUuNjMxIDIuODk0NTIgMTUuNDA3N0MzLjM1ODU5IDE1LjE4OTMgMy45MTc5NSAxNSA0LjUgMTVDNS4xNDEwNiAxNSA1LjYzNzA4IDE1LjIzMDQgNi4wMTI4NCAxNS41OTExQzYuMjgyMzEgMTUuODQ5OCA2LjQ4NjA5IDE2LjE4NDMgNi42MTAwNyAxNi4zODc4QzYuNzE1NTEgMTYuNTYwOSA2LjgxOTk2IDE2Ljc1NzYgNi45ODY2MSAxNi44Nzg4QzcuMDUxMDMgMTYuOTI1NiA3LjE4MTc1IDE3IDcuNSAxN0M4LjE1NDM4IDE3IDguNjYzMDQgMTYuNjg5NSA5LjQ0NTMgMTYuMTY4QzEwLjM3NTQgMTUuNTQ3MiAxMS4zNDY3IDE1IDEyLjUgMTVDMTMuMTc5NSAxNSAxMy43NDE2IDE1LjE3NTggMTQuMTgyIDE1LjU1MzJDMTQuNTU3OCAxNS44NzUzIDE0Ljc2MiAxNi4yODYzIDE0Ljg3NjIgMTYuNTE2MkMxNS4wMzggMTYuODQxMSAxNS4xMjE5IDE3IDE1LjUgMTdDMTYuMTgyMiAxNyAxNi44MzI3IDE2LjY1OTUgMTcuNjYzNCAxNi4xNDgzQzE4LjA3ODMgMTUuODkzIDE4LjQ4OTIgMTUuNjI5IDE4LjkyNzMgMTUuNDE0NEMxOS4zNzIgMTUuMTk2NyAxOS45MDY2IDE1IDIwLjUgMTVDMjEuNjk2NCAxNSAyMi41NzUzIDE1Ljc4MTcgMjMuMDY1MSAxNi4zNDE1QzIzLjM4NTQgMTYuNzA3NiAyMy42NjgxIDE3LjExNDQgMjMuODkxNiAxNy41NDcxQzI0LjEzNCAxOC4wMjc2IDIzLjkyOTUgMTguNjUzMyAyMy40NDcyIDE4Ljg5NDRaIiBmaWxsPSIjMTQyQjJGZmYiLz4NCjwvc3ZnPg==";
    const amenity = await Amenity.create({
      name: "restaurant",
      svg: base64StringMain,
    });

    res.status(200).json({
      status: "success",
      data: {
        amenity,
      },
    });
  } catch (error) {
    next(error);
  }
};
