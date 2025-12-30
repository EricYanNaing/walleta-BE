import { UpdateUserDataDTO } from './user.schema';
import { prisma } from "../../db/client";
import bcrypt from 'bcryptjs';

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
}