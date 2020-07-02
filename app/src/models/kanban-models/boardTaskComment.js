import { Schema, SchemaTypes, model } from 'mongoose';


const BoardTaskCommentSchema = new Schema ({
    createdBy: {
        type: Number,
        required: true
    },
    commentLikedBy: [{ type: Number, required: true }],
    commentLikes:{ type: Number, default: 0 },
    messageWord: { 
        message: { type: String, required: true },
        usersMentioned: [ {type: Number, required: true }] 
    },
}, { timestamps: true })


export default model('BoardTaskComment', BoardTaskCommentSchema);