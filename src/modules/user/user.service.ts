import { UpdateUserDataDTO } from './user.schema';
import { prisma } from "../../db/client";
import bcrypt from 'bcryptjs';
import { toNumber } from '../../utils/decimal';
import { Prisma } from '@prisma/client';

export class UserService {
    static async getUserInfo(userId : string){
        if(!userId) throw Object.assign(new Error("Invalid Credentials."), { status: 400 });

        const matchUser = await prisma.user.findUnique({where : {id : userId}});

        if(!matchUser) throw Object.assign(new Error("User not found."), { status: 400 }); 

        return matchUser;
    }

    static async updateUserInfo(userId: string, data: UpdateUserDataDTO){
        const matchUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!matchUser) throw Object.assign(new Error("User not found."), { status: 400 }); 

        const updateData: any = {};

        if (data.email !== undefined) updateData.email = data.email;
        if (data.username !== undefined) updateData.username = data.username;
        if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
        if (data.limitAmount !== undefined) updateData.limitAmount = data.limitAmount;

        if (data.password) {
            const hash = await bcrypt.hash(data.password, 10);
            updateData.passwordHash = hash;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return user;
    }

    static async getTotalBalance(userId: string) {
        if (!userId) throw Object.assign(new Error("Invalid Credentials."), { status: 400 });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalAmount: true }
        });

        if (!user) throw Object.assign(new Error("User not found."), { status: 404 });

        // Aggregate income transactions
        const incomeResult = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'INCOME'
            },
            _sum: {
                amount: true
            }
        });

        // Aggregate expense transactions
        const expenseResult = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'EXPENSE'
            },
            _sum: {
                amount: true
            }
        });

        const totalIncome = toNumber(incomeResult._sum.amount) ?? 0;
        const totalExpense = toNumber(expenseResult._sum.amount) ?? 0;

        return {
            totalBalance: totalIncome - totalExpense,
            totalIncome,
            totalExpense
        };
    }
}