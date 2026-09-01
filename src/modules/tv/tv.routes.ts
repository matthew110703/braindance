import { Router } from "express";
import { tvController } from "./tv.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  tvListQuerySchema,
  tvDetailsSchema,
  tvRecommendationsSchema,
  tvSeasonDetailsSchema,
  tvEpisodeDetailsSchema,
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

// Season Details routes (both plural and singular aliases)
router.get(
  "/:id/seasons/:season_number",
  validate(tvSeasonDetailsSchema),
  tvController.getTvSeasonDetails
);

router.get(
  "/:id/season/:season_number",
  validate(tvSeasonDetailsSchema),
  tvController.getTvSeasonDetails
);

// Episode Details routes (both plural and singular aliases)
router.get(
  "/:id/seasons/:season_number/episodes/:episode_number",
  validate(tvEpisodeDetailsSchema),
  tvController.getTvEpisodeDetails
);

router.get(
  "/:id/season/:season_number/episode/:episode_number",
  validate(tvEpisodeDetailsSchema),
  tvController.getTvEpisodeDetails
);

export default router;

