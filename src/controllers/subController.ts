import trim from "../util/trim";
import { Request, Response } from "express";
import Post, { PostDocument } from "../models/Post";
import Sub, { SubDocument } from "../models/Sub";
import fs from "fs";

export const createSub = async (req: Request, res: Response) => {
    try {
        let errors:any = {}
        req.body = trim(req.body,['description'])
        let { name, title, description } = req.body
        if(name === ''){
            errors.name = 'Name cant be empty'
        }
        if(name.split(' ').length > 1){
            errors.name = 'Name can contain only one word'
        }
        if(title.length < 5){
            errors.title = 'Title should be at least 5 character long no less'
        }
        if(title.length > 50){
            errors.title = 'Title should be only 50 character long no more'
        }
        if(title === ''){
            errors.title = 'Title cant be empty'
        }
        if(Object.keys(errors).length > 0){
            res.status(400).json({...errors})
        }
        
        let sub: SubDocument = new Sub({...req.body,author:res.locals.user._id})
        res.json(await sub.save())
    } catch (error) {
        console.log({...error})
        res.status(500).json('Something went wrong')
    }
}

export const fetchSub = async (req: Request, res: Response) => {
    let { name } = req.params
    name = name?.toString()
    try {
        let sub: SubDocument | null | any = await Sub.findOne({ name: name}).populate('author')
        if(!sub){
            return res.status(404).json('Sub with that name dont found')
        }
        sub = sub.toObject()
        sub.posts = []
        res.json(sub)
    } catch (error) {
        res.status(404).json('Sub with that name dont found')
    } 
}
export const fetchSubPosts = async (req: Request, res: Response) => {
    let name = req.params.name as string
    let page: number = +(req.query.page  || 0) as number
    const user = res.locals.user
    try {
        let sub: SubDocument | null = await Sub.findOne({ name: name},'_id')
        if(!sub){
            res.status(404).json('Sub with that name dont found')
        }
        let posts:PostDocument[];
        if(user){
            posts = await Post.populateThinLoged(user.username,page,{ sub:sub?._id})
        }else{
            posts = await Post.populateThin(page,{ sub:sub?._id})
        }
        console.log(posts)
        res.json(posts)
    } catch (error) {
        res.status(404).json('Sub with that name dont found')
    } 
}

export const searchSub = async (req: Request, res: Response) => {
    let { name } = req.params
    name = name?.toString()
    try {
        let sub = await Sub.find({name:{ $regex: name, $options: 'i' }},'name imageUrl posts imageUrn')
        if(!sub){
            res.status(404).json('Sub with that name dont found')
        }
        res.json(sub)
    } catch (error) {
        res.status(505).json('Something went wrong')
    }
    
}

export const uploadSubImage = async (req: Request, res: Response) => {
    const file = req.file
    const sub = res.locals.sub
    const type = req.body.type
    try {
        if(type !== 'image' && type !== 'banner'){
            fs.unlinkSync(file.path)
            res.status(400).json('Only images are allowed')
        }
        let oldImage:string = ''
        if(type === 'image'){
            oldImage = sub.imageUrn || ''
            sub.imageUrn = file.filename
        }else if(type === 'banner'){
            oldImage = sub.bannerUrn || ''
            sub.bannerUrn = file.filename
        }
        if(oldImage !== ''){
            fs.unlinkSync(`public\\images\\${oldImage}`)
        }

        res.json(await sub.save())
    } catch (error) {
        console.log(error)
        res.status(500).json({ error:'Something went wrong'})
    }
    
}