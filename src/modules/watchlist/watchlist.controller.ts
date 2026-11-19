import { Request, Response } from "express";
import { watchlistService, WatchlistService } from "./watchlist.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  AddWatchlistInput,
  GetWatchlistQuery,
  WatchlistMediaType,
} from "./watchlist.schema.js";

export class WatchlistController {
  constructor(private readonly service: WatchlistService = watchlistService) {}

  addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const { media_id, media_type } = req.body as AddWatchlistInput;

    const result = await this.service.addToWatchlist(deviceToken, media_id, media_type);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Media item added to watchlist successfully"
        )
      );
  });

  removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const media_id = Number(req.params.media_id ?? req.body.media_id);
    const media_type = (req.query.media_type ?? req.body?.media_type) as
      | WatchlistMediaType
      | undefined;

    const result = await this.service.removeFromWatchlist(
      deviceToken,
      media_id,
      media_type
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Media item removed from watchlist successfully"
        )
      );
  });

  checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const media_id = Number(req.params.media_id || req.query.media_id);
    const media_type = req.query.media_type as WatchlistMediaType | undefined;

    const result = await this.service.checkStatus(deviceToken, media_id, media_type);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Watchlist status retrieved successfully"
        )
      );
  });

  getWatchlist = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const query = req.query as unknown as GetWatchlistQuery;

    const result = await this.service.getWatchlist(deviceToken, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Watchlist items retrieved successfully"
        )
      );
  });
}

export const watchlistController = new WatchlistController();
