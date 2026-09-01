import { Request, Response } from "express";
import { movieService, MovieService } from "./movie.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { MovieListQuery } from "./movie.schema.js";

export class MovieController {
  constructor(private readonly service: MovieService = movieService) {}

  getNowPlaying = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as MovieListQuery;
    const result = await this.service.getNowPlaying(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Now playing movies retrieved successfully"));
  });

  getPopular = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as MovieListQuery;
    const result = await this.service.getPopular(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Popular movies retrieved successfully"));
  });

  getTopRated = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as MovieListQuery;
    const result = await this.service.getTopRated(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Top rated movies retrieved successfully"));
  });

  getUpcoming = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as MovieListQuery;
    const result = await this.service.getUpcoming(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Upcoming movies retrieved successfully"));
  });
}

export const movieController = new MovieController();
