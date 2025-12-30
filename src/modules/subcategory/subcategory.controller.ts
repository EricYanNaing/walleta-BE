import { Request, Response } from "express";
import { parseOrThrow } from "../../utils/zod";
import { SubCategoryDTO, subCategorySchema, updateSubCategoryDataSchema, UpdateSubCategoryDTO } from "./subcategory.schema";
import { SubCategoryService } from "./subcategory.service";

export class SubCategoryController {
    static async create(req: Request, res: Response){
        const dto = parseOrThrow<SubCategoryDTO>(subCategorySchema, req.body);
        const result = await SubCategoryService.create(dto)

        return res.status(201).json(result);
    }

    static async list(req:Request, res: Response){
        const {type} = (req as any).body;
        const result = await SubCategoryService.list(type);

        return res.status(200).json(result);
    }

    static async update(req:Request, res: Response){
        console.log("req body :",req.body)
        const dto = parseOrThrow<UpdateSubCategoryDTO>(updateSubCategoryDataSchema, req.body);
        const {subId,data} = dto;
        const result = await SubCategoryService.update(subId,data)

        return res.status(201).json(result);
    }
}