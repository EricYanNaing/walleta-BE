import {z} from 'zod'

export const entryTypeEnum = z.enum(['EXPENSE','INCOME'])

export const subCategorySchema = z.object({
    name : z.string().min(1).max(128),
    userId : z.cuid(),
    type : entryTypeEnum
})

export const updateSubCategoryDataSchema = z.object({
    subId : z.cuid(),
    data : subCategorySchema
})

export type SubCategoryDTO = z.infer<typeof subCategorySchema>;
export type UpdateSubCategoryDTO = z.infer<typeof updateSubCategoryDataSchema>;