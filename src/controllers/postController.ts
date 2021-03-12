import { NextFunction, Request, Response } from "express";
import trim from "../util/trim";

//Database collections and typescript interfaces for a documents
import Comment, { CommentDocument } from "../models/Comment";
import Post, { PostDocument } from "../models/Post";
import Sub, { SubDocument } from "../models/Sub";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //delete spaces from start and end of the req.body properties except body
        req.body = trim(req.body,['body'])
        let { subId, title, body } = req.body

        //find a sub that corespnse to a sub id user send you
        let sub: Partial<SubDocument> | null  = await Sub.findById(subId,'_id posts')

        //if sub doesnt exist throw an error
        if(!sub){
            throw new Error('Sub with that id doesnt exist')
        }
        
        //create a Post
        let post: PostDocument = new Post({author:res.locals.user._id, title, body, sub:subId})
        
        //add that post to a sub he corespond to
        sub.posts?.push(post._id)

        //save sub and post
        if(sub.save){
            sub?.save()
        }
        let newPost = await post.save()
        //send post with usetVote property
        res.json(await newPost.withUserVote(res.locals.user.username))
    } catch (error) {
        next({message:error.message,status:404})
    }
}

export const fetchPosts = async (req:Request, res:Response, next: NextFunction) => {
    //retrieve a current page
    let page: number = +(req.query.page  || 0) as number

    let user = res.locals.user

    //if user is authorized retrieve posts with userVotes property else don`t
    let posts:PostDocument[];
    if(!user){
        posts = await Post.populateThin(page)
    }else{
        posts = await Post.populateThinLoged(user.username,page)
    }
    res.json(posts) 
}

export const getPost = async (req:Request, res:Response, next: NextFunction) => {
    try {
        let { user } = res.locals
        let { postId: id, slug } = req.params
        //find post with id and slug from params
        let post:PostDocument | null = await Post.findOne({ _id: id , slug})
        if(!post){
            throw new Error('Wrong id or slug of post')
        }
        if(user){
            post = await post.withUserVote(user.username)
        }else{
            post = await post.populate('votes').populate('sub').execPopulate()
        }
        res.json(post)
    } catch (error) {
        next({message:error.message,status:404})
    }
}

export const fetchComments = async (req:Request, res:Response, next: NextFunction) => {
    try {
        let { user } = res.locals
        let { postId, } = req.params
        let comments:any;
        if(user){
            comments = await Comment.populateThinLoged(postId,user.username)
        }else{
            comments = await Comment.populateThin(postId)
        }
        res.json(comments)
    } catch (error) {
        next({message:error.message,status:404})
    }
}
export const createComment = async ( req: Request, res: Response, next: NextFunction ) => {
    let { postId} = req.params
    let { body } = req.body
    let post: PostDocument | null = await Post.findById(postId)
    if(!post){
        throw new Error('Post doesnt exist')
    }
    let comment: CommentDocument = new Comment({body, post:post._id, username: res.locals.user.username })

    let newComment = await comment.save()
    post.comments.push(newComment._id)
    
    await post.save()

    res.json(newComment)

}

// http://localhost:4000/post?page=0 http://localhost:4000/posts?page=0 