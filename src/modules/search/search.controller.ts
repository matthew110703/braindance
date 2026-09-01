import { Request, Response } from "express";
import { searchService, SearchService } from "./search.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  SearchMultiQuery,
  SearchMovieQuery,
  SearchTvQuery,
  SearchKeywordQuery,
} from "./search.schema.js";

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  searchMulti = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchMultiQuery;
    const result = await this.service.searchMulti(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Multi-search results for '${query.query}' retrieved successfully`
        )
      );
  });

  searchMovies = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchMovieQuery;
    const result = await this.service.searchMovies(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Movie search results for '${query.query}' retrieved successfully`
        )
      );
  });

  searchTv = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchTvQuery;
    const result = await this.service.searchTv(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `TV search results for '${query.query}' retrieved successfully`
        )
      );
  });

  searchKeywords = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchKeywordQuery;
    const result = await this.service.searchKeywords(query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Keyword search results for '${query.query}' retrieved successfully`
        )
      );
  });
}

export const searchController = new SearchController();

