import multer, { FileFilterCallback, Multer } from 'multer'

import path from 'path'
import fs from 'fs'
import { NextFunction, Request, Response } from 'express'
import { v4} from 'uuid'
import Sub, { SubDocument } from '../models/Sub'


const multerStorage = multer.diskStorage({
    filename(req:Request,file:Express.Multer.File, callback){
        try {
            const ext = path.extname(file.originalname)
            let fileId = v4()
            console.log(`${fileId}${ext}`)
            callback(null,`${fileId}${ext}`)
        } catch (error) {
            callback(new Error('something wrong with image'),'a')
        }
        
    },
    destination: (req, file, cb) => {
        cb(null, 'public/images');
      }
})

const multerFilter = (req:Request,file:Express.Multer.File, callback:FileFilterCallback) => {
    console.log(file.mimetype)
    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    }else{
        callback(new Error('The file u upload its not an image'))
    }
}

export const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})


export const ownSub = async (req:Request, res:Response, next:NextFunction) => {
    console.log('s1')
    const user = res.locals.user
    const name = req.params.name
    try {
        let sub: SubDocument | null | any = await Sub.findOne({name}).populate({
            path:'author',
            select:'username'
        })
        if(sub?.author.username !== user.username){
            res.status(403).json({error:'You are not owner of that sub'})
        }else{
            res.locals.sub = sub
            next()
        }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong' })
    }
    
}