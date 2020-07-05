import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import { isAuthenticated, isScorecardOwner } from '../authorization';

export default {

    Mutation: {
        addBoardColumn: combineResolvers(
            isAuthenticated,
            async (parent, { boardId, columnInputs }, { me, models }) => {

                const errors = [];
                if (validator.isEmpty(columnInputs.name)) {
                    errors.push({ message: "addBoardColumn -> Column's name can't be empty!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('addBoardColumn -> Invalid column inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const kanbanBoard = await models.KanbanBoard.findById({_id: new ObjectId(boardId)}).populate('columns');

                const columnExists = kanbanBoard.columns.some(col => col.name.toLowerCase() === columnInputs.name.toLowerCase());
                if (columnExists) {
                    const error = new Error('addBoardColumn -> Column already exists!');
                    error.code = 422;
                    throw error;
                }

                const createdBoardColumn = new models.BoardColumn({
                    name: columnInputs.name.toUpperCase(),
                    createdBy: me.id,
                    tasks: [],
                    kanbanBoard: kanbanBoard._id,
                });


                const savedBoardColumn = await createdBoardColumn.save();
                if (!savedBoardColumn) {
                    const error = new Error("addBoardColumn -> Couldn't save the added column!");
                    error.code = 500;
                    throw error;
                }

                kanbanBoard.columns = [...kanbanBoard.columns, savedBoardColumn._id];
                const savedKanbanBoard = await kanbanBoard.save();
                
                if (!savedKanbanBoard) {
                    const error = new Error("addBoardColumn -> Couldn't save the edited board!");
                    error.code = 500;
                    throw error;
                }

                return { 
                    ...savedBoardColumn._doc, 
                    _id: savedBoardColumn._id.toString(),
                    createdAt: savedBoardColumn.createdAt.toISOString(),
                    updatedAt: savedBoardColumn.updatedAt.toISOString() 
                };
            }
        ),
    }
}