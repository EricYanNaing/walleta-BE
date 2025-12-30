import { z } from "zod";

const updateUserDataSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().min(5).optional(),
    password: z.string().min(8).max(128).optional(),
    confirmPassword: z.string().min(8).max(128).optional(),
    totalAmount: z.number().optional(),
    limitAmount: z.number().optional(),
  })
  .refine(
    (obj) =>
      obj.limitAmount !== undefined ||
      obj.totalAmount !== undefined ||
      obj.email !== undefined ||
      obj.username !== undefined ||
      obj.password !== undefined ||
      obj.confirmPassword !== undefined,
    {
      message: "At least one field must be provided",
    }
  );

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  data: updateUserDataSchema,
}); 

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UpdateUserDataDTO = z.infer<typeof updateUserDataSchema>;