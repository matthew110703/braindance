import { Router } from "express";
import { tvController } from "./tv.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  tvListQuerySchema,
  tvDetailsSchema,
  tvRecommendationsSchema,
} from "./tv.schema.js";

const router = Router();

// Static list routes (Must be declared before dynamic /:id routes)
router.get(
  "/airing-today",
  validate(tvListQuerySchema),
  tvController.getAiringToday
);

router.get(
  "/on-the-air",
  validate(tvListQuerySchema),
  tvController.getOnTheAir
);

router.get(
  "/popular",
  validate(tvListQuerySchema),
  tvController.getPopular
);

router.get(
  "/top-rated",
  validate(tvListQuerySchema),
  tvController.getTopRated
);

// Dynamic /:id item routes
router.get(
  "/:id",
  validate(tvDetailsSchema),
  tvController.getTvDetails
);

router.get(
  "/:id/recommendations",
  validate(tvRecommendationsSchema),
  tvController.getTvRecommendations
);

export default router;
