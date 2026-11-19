import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

interface ParsedRequestParts {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ParsedRequestParts;

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      if (parsed.query !== undefined) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (parsed.params !== undefined) {
        Object.defineProperty(req, "params", {
          value: parsed.params,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
