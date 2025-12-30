import { Decimal } from "@prisma/client/runtime/library";

export function toNumber(d? : any) : number | null {
    if (d === null) return null;
    if ( Decimal.isDecimal(d)) return parseFloat(d.toString());
    if (typeof d === 'string') return parseFloat(d);
    if (typeof d === 'number') return d;
    return null;
}

export function serializeDecimalFields<T extends Record<string, any>>(obj : T, keys : (keyof T)[]){
    const copy : any = {...obj};
    for ( const k of keys){
        copy[k as string] = toNumber(obj[k as string])
    }
    return copy as T;
}