import express from "express";

import {
  createPropertyType,
  getAllPropertyType,
} from "../controllers/propertyTypeController";

const propertyTypeRouter = express.Router();

propertyTypeRouter.route("/").get(getAllPropertyType).post(createPropertyType);
export default propertyTypeRouter;
