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
    boardMembers: [{ 
        type: SchemaTypes.ObjectId, ref: 'Scorecard.team', required: true 
    }],

}, { timestamps: true })


export default model('KanbanBoard', KanbanBoardSchema);