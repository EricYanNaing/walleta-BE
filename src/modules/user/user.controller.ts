import { UserService } from "./user.service";
import { updateUserSchema, UpdateUserDTO } from "./user.schema";
import { Request,Response } from "express";
import { parseOrThrow } from "../../utils/zod";

export class UserController{
    static async getUserInfo(req:Request, res:Response){
        const {userId} = (req as any).body;
        const result = await UserService.getUserInfo(userId);

        res.json(result);
    }

    static async updateUserInfo(req:Request, res:Response){
        const dto = parseOrThrow<UpdateUserDTO>(updateUserSchema, req.body);
        const { userId, data } = dto;
        const result = await UserService.updateUserInfo(userId,data);

        res.status(201).json(result);
    }
}