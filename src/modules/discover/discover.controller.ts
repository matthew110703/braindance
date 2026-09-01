import { Request, Response } from "express";
import { discoverService, DiscoverService } from "./discover.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { DiscoverMovieQueryInput, DiscoverTvQueryInput } from "./discover.schema.js";

export class DiscoverController {
  constructor(private readonly service: DiscoverService = discoverService) {}

  discoverMovies = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DiscoverMovieQueryInput;
    const result = await this.service.discoverMovies(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Movies discovered successfully"));
  });

  discoverTvShows = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DiscoverTvQueryInput;
    const result = await this.service.discoverTvShows(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "TV shows discovered successfully"));
  });
}

export const discoverController = new DiscoverController();
