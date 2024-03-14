import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  updateReview,
} from "../controllers/reviewController";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(getAllReviews).post(createReview);
reviewRouter.route("/:reviewId").patch(updateReview).delete(deleteReview);

export default reviewRouter;
