import { Schema, SchemaTypes, model } from 'mongoose';


const BoardColumnSchema = new Schema ({
    name: { type: String, required: true },
    createdBy: {
        type: Number,
        required: true
    },
    tasks: [{ 
        type: SchemaTypes.ObjectId, ref: 'BoardTask', required: true 
    }],
    kanbanBoard: {type: SchemaTypes.ObjectId, ref: 'KanbanBoard',required: true }
},
{ timestamps: true })


export default model('BoardColumn', BoardColumnSchema);