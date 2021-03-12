import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/User";

export default async (req:Request,res: Response, next: NextFunction) => {
    try {
        if(req.cookies.token){
            let token = req.cookies.token
            let { username }: any = jwt.verify(token,process.env.JWT_SECRET!)
            let user: UserDocument | null | any = await User.findOne({ username },'username email _id')
            res.locals.user = user
            next()
        }else{
            next()
        }
    } catch (err) {
        next( { message:'user not logged', status:404 } )
    }
}