import { z } from "zod";
import { entryTypeEnum } from "../subcategory/subcategory.schema";

export const transactionSchema = z.object({
  userId: z.cuid(),
  subCategoryId: z.cuid(),
  amount: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  description: z.string().optional(),
  date: z.coerce.date() ,
  type: entryTypeEnum
});

export type TransactionSchemaDTO = z.infer<typeof transactionSchema>;

export const listTransactionSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: entryTypeEnum.optional(),
    subCategoryId: z.cuid().optional(),

    page: z.preprocess(
      (v) => (v === undefined ? undefined : Number(v)),
      z.number().int().min(1).default(1)
    ),

    pageSize: z.preprocess(
      (v) => (v === undefined ? undefined : Number(v)),
      z.number().int().min(1).default(10)
    ),
  })
  .refine(
    (data) => {
      if (!data.to || !data.from) return true;
      return new Date(data.from) <= new Date(data.to);
    },
    {
      message: "From Date must be less than or equal with To Date",
      path: ["to"],
    }
  );

export type listTransactionDTO = z.infer<typeof listTransactionSchema>;

export const updateTransactionSchema = transactionSchema.extend({
  id: z.cuid(),
  type : entryTypeEnum
});

export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;
