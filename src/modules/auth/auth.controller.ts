import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { parseOrThrow } from "../../utils/zod";
import { registerSchema, loginSchema, RegisterDTO, LoginDTO } from "./auth.schema";

export class AuthController { 
    static async register(req:Request,res:Response){
        const dto = parseOrThrow<RegisterDTO>(registerSchema,req.body);
        const result = await AuthService.register(dto)

        res.status(201).json(result)
    }

    static async login(req:Request,res:Response){
        const dto = parseOrThrow<LoginDTO>(loginSchema,req.body);
        const result = await AuthService.login(dto);

        res.json(result);
    }

    static async getUserInfo(req:Request,res:Response){
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await AuthService.getUser(userId);
        res.json(user);
    }
}