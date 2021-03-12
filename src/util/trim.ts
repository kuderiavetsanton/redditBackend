export default function trim<T extends Record<string,string>,K extends keyof T>(obj: T, exception:K[]) : T{
    const keys: any[] = Object.keys(obj)
    let trimed = keys.reduce((acc, value:K) => {
        acc[value] = obj[value]
        if(exception.indexOf(value)){
            if(acc[value]){
                acc[value] = acc[value].trim()
            }
        } 
        return acc
    },{})
    return trimed
}