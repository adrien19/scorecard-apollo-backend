import { Schema, SchemaTypes, model } from 'mongoose';


const KanbanBoardSchema = new Schema ({
    name: {
        type: String,
        require: true
    },
    columns: [{ 
                type: SchemaTypes.ObjectId, ref: 'BoardColumn', required: true 
            }],
    team: [
        {
            title: { type: String, required: true },
            users: [ {type: Number, required: true }]
        }
    ],

}, { timestamps: true })


export default model('KanbanBoard', KanbanBoardSchema);