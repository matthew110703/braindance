import { Request, Response } from "express";
import { collectionService, CollectionService } from "./collection.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { GetCollectionQuery } from "./collection.schema.js";

export class CollectionController {
  constructor(private readonly service: CollectionService = collectionService) {}

  getCollectionDetails = asyncHandler(async (req: Request, res: Response) => {
    const collectionId = Number(req.params.collection_id);
    const query = req.query as unknown as GetCollectionQuery;

    const result = await this.service.getCollectionDetails(collectionId, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Collection details retrieved successfully"
        )
      );
  });
}

export const collectionController = new CollectionController();
