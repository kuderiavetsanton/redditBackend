import { Schema, model, Document } from 'mongoose'
import { PostDocument } from './Post'
import { CommentDocument } from './Comment'

const voteSchema: Schema = new Schema({
    value:{
        type:Number,
        required:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post"
    },
    username:{
        type:String,
        required:true
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }
})



interface Vote{
    username:string,
    value:number,
    post?:Schema.Types.ObjectId | Partial<PostDocument>,
    comment?:Schema.Types.ObjectId | Partial<CommentDocument>
}


//create interface that implement our Vote interface and that have all build in functionality of a mongoose document
export interface VoteDocument extends Vote, Document {}

export default model<VoteDocument>('Vote',voteSchema)