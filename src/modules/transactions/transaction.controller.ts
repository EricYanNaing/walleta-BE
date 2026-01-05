import { NextFunction, Request, Response } from "express";
import { parseOrThrow } from "../../utils/zod";
import {
  transactionSchema,
  updateTransactionSchema,
  TransactionSchemaDTO,
  UpdateTransactionDTO,
  listTransactionDTO,
  listTransactionSchema
} from "./transaction.schema";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  static async create(req: Request, res: Response) {
    console.log("req body :",req.body)
    try {
      const dto = parseOrThrow<TransactionSchemaDTO>(
        transactionSchema,
        req.body
      );
      const result = await TransactionService.create(dto);

      return res.status(201).json(result);
    } catch (error) {
      console.error(error)
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const dto = parseOrThrow<listTransactionDTO>(
        listTransactionSchema,
        req.query
      );
      const userId = (req as any).user.id;
      console.log("Authenticated userId from JWT:", userId);
      console.log("Query params:", req.query);
      const result = await TransactionService.list(userId, dto);
      console.log("Result count:", result.items.length);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error)
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const dto = parseOrThrow<UpdateTransactionDTO>(
        updateTransactionSchema,
        req.body
      );

      const result = await TransactionService.update(dto);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error)
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const result = await TransactionService.delete(id);

      return res.status(204).json(result);
    } catch (error) {
      console.error(error)
    }
  }
}
