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
      const created = await tx.transaction.create({
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
    }, {
      timeout: 10000
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

  static async getCashflowChart(userId: string, period: 'monthly' | 'yearly' = 'monthly', year?: number) {
    if (period === 'monthly') {
      // Monthly view: Show 12 months of current/specified year
      const currentYear = year || new Date().getFullYear();
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`)
          }
        },
        include: {
          subCategory: true
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = monthNames.map(month => ({
        month,
        income: 0,
        expense: 0
      }));

      transactions.forEach(transaction => {
        const monthIndex = new Date(transaction.date).getMonth();
        const amount = parseFloat(transaction.amount.toString());
        
        if (transaction.subCategory.type === 'INCOME') {
          monthlyData[monthIndex].income += amount;
        } else {
          monthlyData[monthIndex].expense += amount;
        }
      });

      return { data: monthlyData };
    } else {
      // Yearly view: Show last 5 years
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: new Date(`${startYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`)
          }
        },
        include: {
          subCategory: true
        }
      });

      const yearlyData: Array<{ year: string; income: number; expense: number }> = [];
      for (let y = startYear; y <= currentYear; y++) {
        yearlyData.push({
          year: y.toString(),
          income: 0,
          expense: 0
        });
      }

      transactions.forEach(transaction => {
        const transactionYear = new Date(transaction.date).getFullYear();
        const yearIndex = transactionYear - startYear;
        const amount = parseFloat(transaction.amount.toString());
        
        if (yearIndex >= 0 && yearIndex < yearlyData.length) {
          if (transaction.subCategory.type === 'INCOME') {
            yearlyData[yearIndex].income += amount;
          } else {
            yearlyData[yearIndex].expense += amount;
          }
        }
      });

      return { data: yearlyData };
    }
  }

  static async getBudgetBreakdown(userId: string, period: 'monthly' | 'yearly' = 'monthly', year?: number, month?: number) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();

    let startDate: Date;
    let endDate: Date;

    if (period === 'monthly') {
      // Monthly view: Show specific month
      const targetMonth = month !== undefined ? month : currentDate.getMonth() + 1;
      startDate = new Date(`${targetYear}-${String(targetMonth).padStart(2, '0')}-01`);
      endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    } else {
      // Yearly view: Show entire year
      startDate = new Date(`${targetYear}-01-01`);
      endDate = new Date(`${targetYear}-12-31T23:59:59`);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        subCategory: true
      }
    });

    const expenseTransactions = transactions.filter(t => t.subCategory.type === 'EXPENSE');
    
    const categoryMap = new Map<string, number>();
    let totalExpense = 0;

    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.subCategory.name;
      const amount = parseFloat(transaction.amount.toString());
      
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
      totalExpense += amount;
    });

    const data = Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 10000) / 100 : 0
    }));

    return { data };
  }
}
