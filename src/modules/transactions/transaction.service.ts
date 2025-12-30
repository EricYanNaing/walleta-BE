import { prisma } from "../../db/client";
import { Prisma } from "@prisma/client";
import {
  TransactionSchemaDTO,
  UpdateTransactionDTO,
  listTransactionDTO,
} from "./transaction.schema";
import { serializeDecimalFields } from "../../utils/decimal";

export class TransactionService {
  static async create(data: TransactionSchemaDTO) {
    serializeDecimalFields(data, ["amount"]);

    return prisma.$transaction(async (tx) => {
      const created = await prisma.transaction.create({
        data,
        include: { subCategory: true },
      });

      const amount = created.amount;
      const type = created.type;

      const updateTx =
        type === "INCOME" ? amount : new Prisma.Decimal(0).minus(amount);

      await tx.user.update({
        where: { id: created.userId },
        data: { totalAmount: { increment: updateTx } },
      });
      return updateTx;
    });
  }

  static async list(userId: string, data: listTransactionDTO) {
    const { page, pageSize, to, from, type, subCategoryId } = data;

    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (from || to) {
      where.createdAt = {};
      if (from) {
        (where.createdAt as Prisma.DateTimeFilter).gte = new Date(from);
      }
      if (to) {
        (where.createdAt as Prisma.DateTimeFilter).lte = new Date(to);
      }
    }

    if (type) {
      where.subCategory = {
        type,
      };
    }

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { subCategory: true },
        skip,
        take,
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPage = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPage,
    };
  }

  static async update(data: UpdateTransactionDTO) {
  const { id, subCategoryId, amount, description } = data;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findUnique({
      where: { id },
      include: { subCategory: true },
    });

    if (!existing) {
      throw Object.assign(new Error("Transaction not found"), {
        status: 404,
      });
    }

    const newSubCategoryId = subCategoryId ?? existing.subCategoryId;

    const newSubCategory =
      newSubCategoryId === existing.subCategoryId
        ? existing.subCategory
        : await tx.subCategory.findUnique({
            where: { id: newSubCategoryId },
          });

    if (!newSubCategory) {
      throw Object.assign(new Error("SubCategory not found"), {
        status: 400,
      });
    }

    const oldAmount = existing.amount; 
    const newAmount =
      amount !== undefined
        ? new Prisma.Decimal(amount)
        : existing.amount;

    const oldType = existing.subCategory.type; 
    const newType = newSubCategory.type;

    const oldDelta =
      oldType === "INCOME"
        ? oldAmount
        : oldAmount.neg();

    const newDelta =
      newType === "INCOME"
        ? newAmount
        : newAmount.neg();

    const delta = newDelta.minus(oldDelta);

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        subCategoryId: newSubCategoryId,
        amount: newAmount,
        description:
          description !== undefined ? description : existing.description,
      },
      include: { subCategory: true },
    });

    await tx.user.update({
      where: { id: existing.userId },
      data: {
        totalAmount: {
          increment: delta,
        },
      },
    });

    return updated;
  });
}

  static async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await prisma.transaction.findUnique({ where: { id }, include : {subCategory : true} });

      if (!existing)
        throw Object.assign(new Error("Invalid Credentials."), { status: 404 });

      const amount = existing.amount;
      const type = existing.type;

      const delta =
        type === "INCOME" ? new Prisma.Decimal(0).minus(amount) : amount;

      await tx.transaction.delete({ where: { id } });

      await tx.user.update({
        where: { id: existing.userId },
        data: {
          totalAmount: { increment: delta },
        },
      });

      return { success: true };
    });
  }
}
