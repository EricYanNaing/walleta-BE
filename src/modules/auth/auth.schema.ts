import {z} from 'zod'

export const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(5),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // error will be on confirmPassword field
  });

export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    identifier : z.string().min(1), // can be username or email
    password : z.string().min(8).max(128)
})

export type LoginDTO = z.infer<typeof loginSchema>