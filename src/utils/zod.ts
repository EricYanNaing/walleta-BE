import { ZodError } from "zod";

export function parseOrThrow<T>(schema : any, data : unknown) : T {
    const result = schema.safeParse(data);
    if(!result.success){
        throw result.error
    }
    return result.data as T;
}

export function formatZodError(err : ZodError){
    return err.issues.map((i) => ({
        path : i.path.join('.'),
        message : i.message,
        code : i.code
    }))
}