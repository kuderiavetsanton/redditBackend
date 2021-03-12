import { NextFunction, Request, Response, Router } from "express";
import auth from "../middleware/auth";
import user from "../middleware/user";
import Comment, { CommentDocument } from "../models/Comment";
import Post, { PostDocument } from "../models/Post";
import Sub, { SubDocument } from "../models/Sub";
import Vote, { VoteDocument } from "../models/Vote";

const router = Router()

router.post('/vote',user,auth,async (req: Request,res: Response,next: NextFunction) => {
    let { value, postId, commentId } = req.body
    value = +value
    const { username } = res.locals.user
    let skipValues = [1,0,-1]
    if(!skipValues.includes(value)){
        res.status(404).json('Value could be only 1, 0 or -1')
    }
    try {
        let post: any;
        let comment: any;
        let vote: VoteDocument | null;
        if(commentId){
            comment = await Comment.findById(commentId)
            if(!comment){
                res.status(404).json("Comment dosn't exist")
            }
            vote = await Vote.findOne({ username, comment: comment?._id })
        }else{
            post = await Post.findById(postId)
            if(!post){
                res.status(404).json("Post dosn't exist")
            }
            vote = await Vote.findOne({ username, post: post?._id })
        }
        if (!vote && value === 0) {
            console.log('!vote && value === 0')
            // if no vote and value = 0 return error
            return res.status(404).json({ error: 'Vote not found' })
        }else if(!vote){
            console.log('!vote')
            vote = new Vote({ username, value })
            
            if(comment){
                vote.comment = comment._id
                comment.votes.push(vote._id)
            }else{
                vote.post = postId
                post?.votes.push(vote._id)
            }
            await vote.save()
        }else if(value === 0){
            if(comment){
                comment.votes = comment.votes.filter((e:any) => e !== vote?._id)
            }else{
                post.votes = post.votes.filter((e:any) => e !== vote?._id)
            }
            await vote.remove()
            
        }else if (vote.value !== value) {
            // If vote and value has changed, update vote
            console.log('vote.value !== value')
            vote.value = value
            await vote.save()
        }
        if(comment){
            await comment.save()
            res.json(await comment?.withUserVote(username))
        }else if(post){
            await post.save()
            res.json(await post?.withUserVote(username))
        }
    } catch (error) {
        console.log({error})
        res.status(500).json('Server error')
    }
})
router.get('/top',async (req: Request,res: Response,next: NextFunction) => {
    try {
        let topSubs = await Sub.aggregate([
            { $addFields:{postsAmount:{$size:'$posts'},imageUrl:{$cond:{
                if:'$imageUrn',
                then:{$concat:[`${process.env.APP_DOMMEN}/images/`,'$imageUrn']},
                else:`https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`
            }}}},
            { $sort: {postsAmount:-1} },
            { $project:{author:1,description:1,title:1,posts:1,name:1,imageUrl:1, postAmount:1,imageUrn:1}},
            { $limit: 5 }
        ])
        console.log(topSubs)
        res.json(topSubs)
    } catch (error) {
        res.json(404).json({error:'Something went wrong'})
    }
    
})



export default router