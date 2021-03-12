import { Schema, model, Document } from 'mongoose'
import { PostDocument } from './Post'
import { UserDocument } from './User'

const subSchema: Schema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    title:{
        type:String,
        required:true
    },
    description:String,
    imageUrn:String,
    bannerUrn:String,
    posts:[{
        type:Schema.Types.ObjectId,
        ref:'Post',
        required:true
    }],
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{ 
    timestamps:true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

interface Sub{
    name:string,
    author:Schema.Types.ObjectId | Partial<UserDocument>,
    title:string,
    description?:string,
    posts:Schema.Types.ObjectId[] | Partial<PostDocument>[],
    imageUrn?:string,
    bannerUrn?:string,
    imageUrl?:string,
    bannerUrl?:string,
    createdAt?:Date,
    updatedAt?:Date
}


//create interface that implement our Sub interface and that have all build in functionality of a mongoose document
export interface SubDocument extends Sub, Document {}


//virtual that create full url from urn for image
subSchema.virtual('imageUrl').get(function(this:SubDocument){
    return this.imageUrn ? `${process.env.APP_DOMMEN}/images/${this.imageUrn}` : `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`
})
//virtual that create full url from urn  for banner
subSchema.virtual('bannerUrl').get(function(this:SubDocument){
    return this.bannerUrn ? `${process.env.APP_DOMMEN}/images/${this.bannerUrn}` : null
})

export default model<SubDocument>('Sub',subSchema)