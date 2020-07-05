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
    createdBy: {
        type: Number,
        required: true
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
    statusChangedTime: {
        type: String,
    },
    boardColumn: {
        type: SchemaTypes.ObjectId, ref: 'BoardColumn', required: true
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