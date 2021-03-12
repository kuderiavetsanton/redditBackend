import { NextFunction, Request, Response } from "express";

export default async (req:Request,res: Response, next: NextFunction) => {
    try {
        let user = res.locals.user
        if(!user){
            throw new Error('Unauthenticated')
        }
        next()
    } catch (err) {
        console.log(err)
        next( { message:err.message, status:404 } )
    }
}