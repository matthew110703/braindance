import { Request, Response } from "express";
import { tvService, TvService } from "./tv.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  TvListQuery,
  TvDetailsQuery,
  TvRecommendationsQuery,
} from "./tv.schema.js";

export class TvController {
  constructor(private readonly service: TvService = tvService) {}

  getAiringToday = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TvListQuery;
    const result = await this.service.getAiringToday(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Airing today TV shows retrieved successfully"));
  });

  getOnTheAir = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TvListQuery;
    const result = await this.service.getOnTheAir(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "On the air TV shows retrieved successfully"));
  });

  getPopular = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TvListQuery;
    const result = await this.service.getPopular(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Popular TV shows retrieved successfully"));
  });

  getTopRated = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TvListQuery;
    const result = await this.service.getTopRated(query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "Top rated TV shows retrieved successfully"));
  });

  getTvDetails = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const query = req.query as unknown as TvDetailsQuery;
    const result = await this.service.getTvDetails(id, query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "TV show details retrieved successfully"));
  });

  getTvRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const query = req.query as unknown as TvRecommendationsQuery;
    const result = await this.service.getTvRecommendations(id, query);

    res
      .status(200)
      .json(new ApiResponse(200, result, "TV show recommendations retrieved successfully"));
  });

  getTvSeasonDetails = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = Number(req.params.id);
    const seasonNumber = Number(req.params.season_number);
    const query = req.query as unknown as TvDetailsQuery;
    const result = await this.service.getTvSeasonDetails(seriesId, seasonNumber, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `TV season ${seasonNumber} details retrieved successfully`
        )
      );
  });

  getTvEpisodeDetails = asyncHandler(async (req: Request, res: Response) => {
    const seriesId = Number(req.params.id);
    const seasonNumber = Number(req.params.season_number);
    const episodeNumber = Number(req.params.episode_number);
    const query = req.query as unknown as TvDetailsQuery;
    const result = await this.service.getTvEpisodeDetails(
      seriesId,
      seasonNumber,
      episodeNumber,
      query
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `TV episode S${seasonNumber}E${episodeNumber} details retrieved successfully`
        )
      );
  });
}

export const tvController = new TvController();

