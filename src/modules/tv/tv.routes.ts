import { Router } from "express";
import { tvController } from "./tv.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { tvListQuerySchema } from "./tv.schema.js";

const router = Router();

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

export default router;
