import { Request, Response } from "express";
import { trendingService, TrendingService } from "./trending.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { TrendingRequestParams, TrendingRequestQuery } from "./trending.schema.js";
import { TimeWindow } from "./trending.types.js";

export class TrendingController {
  constructor(private readonly service: TrendingService = trendingService) {}

  getTrendingAll = asyncHandler(async (req: Request, res: Response) => {
    const params = req.params as unknown as TrendingRequestParams;
    const query = req.query as unknown as TrendingRequestQuery;
    const timeWindow: TimeWindow = (params.time_window as TimeWindow) || "day";

    const result = await this.service.getTrendingAll(timeWindow, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Trending items for time window '${timeWindow}' retrieved successfully`
        )
      );
  });

  getTrendingMovies = asyncHandler(async (req: Request, res: Response) => {
    const params = req.params as unknown as TrendingRequestParams;
    const query = req.query as unknown as TrendingRequestQuery;
    const timeWindow: TimeWindow = (params.time_window as TimeWindow) || "day";

    const result = await this.service.getTrendingMovies(timeWindow, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Trending movies for time window '${timeWindow}' retrieved successfully`
        )
      );
  });

  getTrendingTv = asyncHandler(async (req: Request, res: Response) => {
    const params = req.params as unknown as TrendingRequestParams;
    const query = req.query as unknown as TrendingRequestQuery;
    const timeWindow: TimeWindow = (params.time_window as TimeWindow) || "day";

    const result = await this.service.getTrendingTv(timeWindow, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Trending TV shows for time window '${timeWindow}' retrieved successfully`
        )
      );
  });
}

export const trendingController = new TrendingController();
