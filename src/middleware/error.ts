import { ZodError } from "zod"
import { NextFunction, Request, Response } from "express"
import { formatZodError } from "../utils/zod"

export function errorHandler (err : any, req:Request, res: Response, next: NextFunction){
    if(err instanceof ZodError){
        return res.status(400).json({error : 'Validation Error', issues : formatZodError(err)})
    }

    if(err?.name === 'Unauthorized'){
        return res.status(401).json({error : 'Unauthorized'})
    }

    const status = err?.status ?? 500;
    const message = err?.message ?? 'Internal Server Error';
    return res.status(status).json({error : message})
}