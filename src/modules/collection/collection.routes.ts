import { Router } from "express";
import { collectionController } from "./collection.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { getCollectionSchema } from "./collection.schema.js";

const router = Router();

// Get collection details by ID
router.get(
  "/:collection_id",
  validate(getCollectionSchema),
  collectionController.getCollectionDetails
);

export default router;
