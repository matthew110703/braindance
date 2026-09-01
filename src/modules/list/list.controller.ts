import { Request, Response } from "express";
import { listService, ListService } from "./list.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  CreateListInput,
  GetListDetailsInput,
  CheckListItemStatusInput,
  ListMediaItemInput,
} from "./list.schema.js";

export class ListController {
  constructor(private readonly service: ListService = listService) {}

  createList = asyncHandler(async (req: Request, res: Response) => {
    const { body, query } = req as unknown as CreateListInput;
    const result = await this.service.createList(body, query.session_id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "List created successfully"
        )
      );
  });

  getListDetails = asyncHandler(async (req: Request, res: Response) => {
    const { params, query } = req as unknown as GetListDetailsInput;
    const result = await this.service.getListDetails(params.list_id, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `List details for list ${params.list_id} retrieved successfully`
        )
      );
  });

  checkItemStatus = asyncHandler(async (req: Request, res: Response) => {
    const { params, query } = req as unknown as CheckListItemStatusInput;
    const result = await this.service.checkItemStatus(params.list_id, query);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Item status in list ${params.list_id} checked successfully`
        )
      );
  });

  addMovie = asyncHandler(async (req: Request, res: Response) => {
    const { params, query, body } = req as unknown as ListMediaItemInput;
    const result = await this.service.addMovie(
      params.list_id,
      body,
      query.session_id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Movie ${body.media_id} added to list ${params.list_id} successfully`
        )
      );
  });

  removeMovie = asyncHandler(async (req: Request, res: Response) => {
    const { params, query, body } = req as unknown as ListMediaItemInput;
    const result = await this.service.removeMovie(
      params.list_id,
      body,
      query.session_id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          `Movie ${body.media_id} removed from list ${params.list_id} successfully`
        )
      );
  });
}

export const listController = new ListController();
