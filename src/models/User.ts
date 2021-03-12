import { Schema, model, Document, Model } from 'mongoose'

//validation function that checking if value is Email
import isEmail from 'validator/lib/isEmail';

import bcrypt from 'bcryptjs'
import { PostDocument } from './Post';
import { SubDocument } from './Sub';

const userSchema: Schema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        minLength:[3,'Username must be at least 3 character long'],
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate:{
            validator: isEmail,
            message:(props:any) => `'${props.value}' is not a valid email`
        }
    },
    password:{
        type:String,
        required:true,
        minlength:[6,'Password must be at least 6 character long']
    },
    subs:[
        {
            type:Schema.Types.ObjectId,
            ref:'Sub',
            required:true
        }
    ],
    posts:[
        {
            type:Schema.Types.ObjectId,
            ref:'Post',
            required:true
        }
    ]
})

interface User{
    username:string,
    email:string,
    password:string,
    posts:Schema.Types.ObjectId[] | Partial<PostDocument>[],
    subs:Schema.Types.ObjectId[] | Partial<SubDocument>[]
}
//create interface that implement our User interface and that have all build in functionality of a mongoose document
export interface UserDocument extends User, Document {}

//create UserModel that implements all mongoose static method that should return UserDocument and add our own static method 
export interface UserModel extends Model<UserDocument> {}

userSchema.pre<UserDocument>('save', async function(next){
    let hashPassword = await bcrypt.hash(this.password,10)
    this.password = hashPassword
})

export default model<UserDocument, UserModel>('User',userSchema)