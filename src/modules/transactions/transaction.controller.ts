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
      const result = await TransactionService.list(userId, dto);
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

  static async getCashflowChart(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const period = (req.query.period as 'monthly' | 'yearly') || 'monthly';
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      const result = await TransactionService.getCashflowChart(userId, period, year);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch cashflow chart data' });
    }
  }

  static async getBudgetBreakdown(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const period = (req.query.period as 'monthly' | 'yearly') || 'monthly';
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      
      const result = await TransactionService.getBudgetBreakdown(userId, period, year, month);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch budget breakdown data' });
    }
  }
}
