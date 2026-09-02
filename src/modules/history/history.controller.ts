import { Request, Response } from "express";
import { historyService, HistoryService } from "./history.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { UpdateHistoryInput, GetHistoryListQuery } from "./history.schema.js";

export class HistoryController {
  constructor(private readonly service: HistoryService = historyService) {}

  updateProgress = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const media_id = Number(req.params.media_id);
    const body = req.body as UpdateHistoryInput;

    const result = await this.service.updateProgress(deviceToken, media_id, body);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result.data,
          result.message
        )
      );
  });

  getProgress = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const media_id = Number(req.params.media_id);

    const result = await this.service.getProgress(deviceToken, media_id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Watch progress retrieved successfully"
        )
      );
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const query = req.query as unknown as GetHistoryListQuery;

    const result = await this.service.getHistory(deviceToken, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Watch history retrieved successfully"
        )
      );
  });

  removeFromHistory = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;
    const media_id = Number(req.params.media_id);

    const result = await this.service.removeFromHistory(deviceToken, media_id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          result.message
        )
      );
  });

  clearHistory = asyncHandler(async (req: Request, res: Response) => {
    const deviceToken = req.deviceId!;

    const result = await this.service.clearHistory(deviceToken);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          result.message
        )
      );
  });
}

export const historyController = new HistoryController();
