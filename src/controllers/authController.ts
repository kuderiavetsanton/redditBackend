import { Request, Response, NextFunction } from 'express'
import trim from '../util/trim'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

import bcrypt from 'bcryptjs'

//Database collections and typescript interfaces
import User, { UserDocument } from '../models/User'

export const register = async (req:Request, res:Response, next: NextFunction) => {
    try {
        //delete spaces from a start and end of the req.body properties except password
        req.body = trim(req.body,['password'])

        //create User
        const user:any = await User.create(req.body)
        res.json({ email:user.email, username: user.username}) 
    } catch (error) {
        let validationErrors: Record<string,string> = {}
        //validation failed
        if(error.errors){
            for(let key in error.errors){
                validationErrors[key] = error.errors[key].properties.message
            }
            res.status(400).json(validationErrors)
        }
        //uniquness failed
        else if(error.code === 11000){
            const key = Object.keys(error.keyValue)[0]
            res.status(400).json({errors:{[key]:`Your ${key} is already taken`}})
        }else if (error){
            console.log(error)
            res.status(500).json({error:error,message:'that error'})
        }
    }
}
export const login = async ( req: Request, res: Response, next:NextFunction) => {
    try {
        const { password, username } = req.body

        //find a user with that username
        const user: UserDocument | null = await User.findOne({ username },'username email password')
        //check if user exist
        if(user){
            //compare passwords in database and what we recieve from client
            const isMatch = await bcrypt.compare(password,user.password)
            //if its match set create token and set Cookie and send it to a Client back
            if(isMatch){
                const token = jwt.sign({ username: user.username },process.env.JWT_SECRET!)
                res.json({ username,email:user.email,token })
            }else{
                throw new Error("User with that username or password doesn't exist")
            }
        }else{
            throw new Error("User with that username or password doesn't exist")
        }

        
    } catch (error) {
        next({ message:error.message, status:422 })
    }
    
}

export const me = (req:Request, res: Response) => {
    // if user exist send its email and username to the client
    const user = res.locals.user
    if(user){
        res.json({ username:user.username, email: user.email })
    }else{
        res.status(302).json({ error:'User not logged' })
    }
}
