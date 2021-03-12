import { Schema, model, Document, Model } from 'mongoose'
import { PostDocument } from './Post'
import { VoteDocument } from './Vote'

const commentSchema: Schema = new Schema({
    body:{
        type:String,
        required:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    username:{
        type:String,
        required:true
    },
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



interface Comment{
    username:string,
    body:string,
    post:Schema.Types.ObjectId | Partial<PostDocument>,
    votes:Schema.Types.ObjectId[] | Partial<VoteDocument>[],
    voteScore:number,
    withUserVote:(username: string) => CommentDocument,
    userVote?:number
}

//virtual that show amount of votes in Comment 
commentSchema.virtual('voteScore').get(function(this: any){
    if(this.populated('votes')){
        return this.votes.reduce((prev:number,next: { value:number }) => prev + next.value,0)
    }
})
//method that we call if user is logged in the end we add property that shows if user has voted and how he what
commentSchema.methods.withUserVote = async function(this: any, username: string){
    let populatedComment: any = await this.populate('votes').execPopulate()
    populatedComment = populatedComment.toObject()
    let voteMark = populatedComment.votes.find((vote:any) => vote.username === username)
    let userVote;
    if(voteMark){
        userVote = voteMark.value
    }else{
        userVote = 0
    }
    let result = {...populatedComment,userVote,voteScore:this.voteScore}
    return result
}

//create CommentModel that implements all mongoose static method that should return CommentDocument and add our own static method
interface CommentModel extends Model<CommentDocument>{
    populateThin(postId:string) : CommentDocument[],
    populateThinLoged(postId:string,username:string) : CommentDocument[]
}

//populate Comment with Author , Sub and Votes
commentSchema.statics.populateThin = function(postId:string,) {
    return this.find({post:postId}).populate('votes')
};


//populate Comment with Author , Sub and Votes and add additional property (withUserVote)
commentSchema.statics.populateThinLoged = async function(postId:string,username: string) {
    let populatedComments = await this.find({post:postId}).populate('votes')
    populatedComments = populatedComments.map(( comment:any ) => {
        let voteMark = comment.votes.find((vote:any) => vote.username === username)
        let userVote;
        if(voteMark){
            userVote = voteMark.value
        }else{
            userVote = 0
        }
        comment = comment.toObject()
        let result = {...comment,userVote}
        return result
    })
    return populatedComments
};

//create interface that implement our Comment interface and that have all build in functionality of a mongoose document
export interface CommentDocument extends Comment, Document {}

export default model<CommentDocument,CommentModel>('Comment',commentSchema)