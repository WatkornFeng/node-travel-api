import express from "express";
import { getProvinces } from "../controllers/provinceController";
const provincecRouter = express.Router();

provincecRouter.route("/").get(getProvinces);

export default provincecRouter;
