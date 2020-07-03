import { Schema, SchemaTypes, model } from 'mongoose';


const KanbanBoardSchema = new Schema ({
    name: {
        type: String,
        require: true
    },
    columns: [
        {
            name: { type: String, required: true },
            tasks: [{ 
                type: SchemaTypes.ObjectId, ref: 'BoardTask', required: true 
            }]
        }
    ],
    scorecard: { 
        type: SchemaTypes.ObjectId, ref: 'Scorecard', required: true 
    },

}, { timestamps: true })


export default model('KanbanBoard', KanbanBoardSchema);