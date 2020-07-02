import { Schema, SchemaTypes, model } from 'mongoose';


const BoardTaskSchema = new Schema ({
    description: {
        type: String,
        require: true
    },
    taskStatus: {
        type: String,
        required: true,
    },
    createdTime: {
        type: String,
        required: true,
    },
    assigned: {
        type: Boolean,
        default: false
    },
    assignedTo: [{
        type: Number,
        required: true
    }],
    assignedBy: {
        type: Number,
        required: true
    },
    statusChangedTime:{
        type: String,
    },
    comments: [
        { 
            type: SchemaTypes.ObjectId, ref: 'BoardTaskComment', required: true 
        }
    ],
    detailedDescription: {
        type: String,
        default: ''
    }

}, { timestamps: true })


export default model('BoardTask', BoardTaskSchema);