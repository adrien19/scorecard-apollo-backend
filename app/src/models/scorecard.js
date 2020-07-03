import mongodb from 'mongodb';
import { Schema, SchemaTypes, model } from 'mongoose';


const scorecardSchema = new Schema ({
    title: {
        type: String,
        require: true
    },
    status: {
        type: Array,
        required: true
    },
    projectStatus: {
        type: String,
        required: true,
        uppercase: true,
    },
    kanbanBoard: { 
        type: SchemaTypes.ObjectId, ref: 'KanbanBoard', required: true 
    },
    createdBy: {
        type: Number,
        required: true
    },
    publication: {
        status: {
            type: Boolean,
            default: false,
        },
        statusChangedAt: { type: String }
    }
}, { timestamps: true })


export default model('Scorecard', scorecardSchema);
