import express from "express";

import { createAmenity, getAllAmenity } from "../controllers/amenityController";

const amenityRouter = express.Router();

amenityRouter.route("/").get(getAllAmenity).post(createAmenity);
export default amenityRouter;
