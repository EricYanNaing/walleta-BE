import {prisma} from '../../db/client'
import { SubCategoryDTO } from './subcategory.schema'

export class SubCategoryService {
    static async create(data : SubCategoryDTO){
       return  prisma.subCategory.create({data});
    }

    static async list(type? : 'EXPENSE' | 'INCOME'){
        return prisma.subCategory.findMany({where : {type}})
    }
    
    static async update(subId : string,data: SubCategoryDTO){
        const matching = await prisma.subCategory.findUnique({where : {id : subId}});

        if(!matching) throw Object.assign(new Error("Invalid Credentials."), {status : 400});

        const updateSubCategory = await prisma.subCategory.update({
            where: {id : subId},
            data
        })

        return updateSubCategory;
    }
}