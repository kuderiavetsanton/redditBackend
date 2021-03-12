import { Schema, model, Document, Model } from 'mongoose'

//function that create  a slug from a title of a post
import { slugify } from '../util/slugify'

import { CommentDocument } from './Comment'
import { SubDocument } from './Sub'
import { UserDocument } from './User'
import { VoteDocument } from './Vote'

const postSchema: Schema = new Schema({
    title:{
        type:String,
        required:true
    },
    body:String,
    sub:{
        type:Schema.Types.ObjectId,
        ref:'Sub',
        required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    slug:String,
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:"Comment",
        }
    ],
    votes:[
        {
            type:Schema.Types.ObjectId,
            ref:"Vote",
        }
    ]
},{ 
    timestamps:true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})



interface Post{
    slug:string,
    author:Schema.Types.ObjectId | Partial<UserDocument>,
    title:string,
    body:string,
    sub:Schema.Types.ObjectId | Partial<SubDocument>,
    comments:Schema.Types.ObjectId[] | Partial<CommentDocument>[],
    url?:string,
    votes:Schema.Types.ObjectId[] | Partial<VoteDocument>[],
    voteScore?:number,
    commentsAmount?:number,
    withUserVote:(username: string) => PostDocument,
    userVote:number,
    createdAt:Date
}

//create interface that implement our Post interface and that have all build in functionality of a mongoose document
export interface PostDocument extends  Document,Post{}

//virtual that created from id and slug and in result we have url
postSchema.virtual('url').get(function( this: PostDocument) {
    return `${this._id}/${this.slug}`;
});

//virtual that show amount of votes in Post 
postSchema.virtual('voteScore').get(function(this: any){
    if(this.populated('votes')){
        return this.votes.reduce((prev:number,next: { value:number }) => prev + next.value,0)
    }
})

//virtual that show amount of comments in post
postSchema.virtual('commentsAmount').get(function( this: PostDocument ){
    return this.comments?.length
}) 


//method that we call if user is logged in the end we add property that shows if user has voted and how he what
postSchema.methods.withUserVote = async function(this: any, username: string){
    let populatedPost: any = await this.populate('votes').populate('sub').execPopulate()
    populatedPost = populatedPost.toObject()
    let voteMark = populatedPost.votes.find((vote:any) => vote.username === username)
    let userVote;
    if(voteMark){
        userVote = voteMark.value
    }else{
        userVote = 0
    }
    let result = {...populatedPost,userVote}
    return result
}

//create PostModel that implements all mongoose static method that should return PostDocument and add our own static method 
interface PostModel extends Model<PostDocument>{
    populateThin(page:number,condition?:any) : PostDocument[],
    populateThinLoged(username:string,page:number,condition?:any) : PostDocument[]
}

//amount of posts per page
const limit = 6

//populate Post with Author , Sub and Votes
postSchema.statics.populateThin = async function(page:number,condition?:any,) {
    return await this.find(condition || null).populate({ path:'author', select:'username email'}).populate({path:'sub', select:'name imageUrl imageUrn'}).populate('votes').sort({createdAt:-1}).skip(limit * page).limit(limit)
};

//populate Post with Author , Sub and Votes and add additional property (withUserVote)
postSchema.statics.populateThinLoged = async function(username: string,page:number,condition?:any) {
    let populatedPosts
    populatedPosts = await this.find(condition || null).populate({ path:'author', select:'username email'}).populate({path:'sub', select:'name imageUrl imageUrn'}).populate('votes').sort({createdAt:-1}).skip(limit * page).limit(limit)
    
    populatedPosts = populatedPosts.map(( post:any ) => {
        let voteMark = post.votes.find((vote:any) => vote.username === username)
        let userVote;
        if(voteMark){
            userVote = voteMark.value
        }else{
            userVote = 0
        }
        post = post.toObject()
        let result = {...post,userVote}
        return result
    })
    return populatedPosts
};

//add slug before saving document
postSchema.pre<PostDocument>('save',function(next){
    this.slug = slugify(this.title)
    next()
})

export default model<PostDocument,PostModel>('Post',postSchema)