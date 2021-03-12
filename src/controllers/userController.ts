import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import User, { UserDocument } from "../models/User";


export const getUser = async ( req: Request, res: Response ) => {
    let { username } = req.params
    username = username?.toString()
    let me = res.locals.user
    try {
        let user: UserDocument | null | any = await User.findOne({ username },'username')
        let comments = await Comment.find({ username:username }).populate({
            path:'post',
            select:'title slug url sub',
            populate:{
                path:'sub',
                select:'name'
            }
        })
        let posts
        if(!user){
            return res.status(404).json({ error: 'User with that name doesnt exist'})
        }
        if(me){
            posts = await Post.populateThinLoged(me.username,0,{ author: user._id})

        }else{
            posts = await Post.populateThin(0,{ author: user._id})
        }
        let submitions:any = [ ...posts ]
        comments.forEach( (comment:any )=> {
            submitions.push({...comment.toObject(),type:'Comment'})
        })
        user = user.toObject()
        submitions = submitions.sort((a:any, b:any) => {
            if(a.createdAt > b.createdAt) return -1
            else if(a.createdAt < b.createdAt) return 1
            else return 0
        })
        res.json({ ...user,submitions })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong'})
    }
}