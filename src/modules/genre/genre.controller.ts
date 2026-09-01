import { Request, Response } from "express";
import { genreService, GenreService } from "./genre.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { GenreQuery } from "./genre.schema.js";

export class GenreController {
  constructor(private readonly service: GenreService = genreService) {}

  getMovieGenres = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GenreQuery;
    const result = await this.service.getMovieGenres(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Movie genres retrieved successfully"
        )
      );
  });

  getTvGenres = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GenreQuery;
    const result = await this.service.getTvGenres(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "TV genres retrieved successfully"
        )
      );
  });

  getAllGenres = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GenreQuery;
    const result = await this.service.getAllGenres(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "All genres retrieved successfully"
        )
      );
  });
}

export const genreController = new GenreController();
