import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import { isAuthenticated, isScorecardOwner } from '../authorization';

export default {
    Query: {
        kanbanBoard: combineResolvers(
            isAuthenticated,
            async (parent, { id }, { models, token }) => {
                const kanbanBoard = await models.KanbanBoard.findById({_id: new ObjectId(id)})
                    .populate( 
                        {
                            path: 'columns', 
                            populate: [
                                { path: 'tasks' , populate: [{ path: 'comments'}]
                            },
                        ]
                    }
                );
                     
                if (!kanbanBoard) {
                    const error = new Error('Kanboard not found!');
                    error.code = 401;
                    throw error;
                }
                
                return {
                    ...kanbanBoard._doc, 
                    _id: kanbanBoard._id.toString(),
                    createdAt: kanbanBoard.createdAt.toISOString(),
                    updatedAt: kanbanBoard.updatedAt.toISOString(),
                }
            }
        ),
    },

    Mutation: {
        updateKanbanBoard: combineResolvers(
            isAuthenticated,
            async (parent, { id, boardInputs }, { me, models }) => {
                const errors = [];
                if (validator.isEmpty(boardInputs.name)) {
                    errors.push({ message: "Board's name can't be empty!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid board inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const kanbanBoard = await models.KanbanBoard.findById({ _id: new ObjectId(id)});
                if (!kanbanBoard) {
                    const error = new Error('Board not found');
                    error.code = 401;
                    throw error;
                }

                kanbanBoard.name = boardInputs.name? boardInputs.name : kanbanBoard.name;
                kanbanBoard.columns = boardInputs.columns? boardInputs.columns : kanbanBoard.columns;
                kanbanBoard.team = boardInputs.team? boardInputs.team : kanbanBoard.team;

                const savedKanbanBoard = await kanbanBoard.save();
                if (!savedKanbanBoard) {
                    const error = new Error("Couldn't save the edited board!");
                    error.code = 500;
                    throw error;
                }
        
                return { 
                    ...savedKanbanBoard._doc, 
                    _id: savedKanbanBoard._id.toString(),
                    createdAt: savedKanbanBoard.createdAt.toISOString(),
                    updatedAt: savedKanbanBoard.updatedAt.toISOString() 
                };
            }
        ),

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

        addBoardTask: combineResolvers(
            isAuthenticated,
            async (parent, { columnId, taskInputs }, { me, models }) => {

                const errors = [];
                if (validator.isEmpty(taskInputs.description)) {
                    errors.push({ message: "Task's description can't be empty!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid board inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const boardColumn = await models.BoardColumn.findById({_id: new ObjectId(columnId)});

                const newDescription = boardColumn.tasks.some(task => task.description === taskInputs.description)? `${taskInputs.description} - COPY` : taskInputs.description;


                const createdBoardTask = new models.BoardTask({
                    description: newDescription,
                    taskStatus: taskInputs.taskStatus,
                    assigned: false,
                    assignedTo: [],
                    assignedBy: me.id,
                    boardColumn: boardColumn._id,
                    comments: [],
                });


                const savedBoardTask = await createdBoardTask.save();
                if (!savedBoardTask) {
                    const error = new Error("addBoardTask -> Couldn't save the added task!");
                    error.code = 500;
                    throw error;
                }

                boardColumn.tasks = [...boardColumn.tasks, savedBoardTask._id];
                const savedBoardColumn = await boardColumn.save();
                
                if (!savedBoardColumn) {
                    const error = new Error("addBoardTask -> Couldn't save the edited column!");
                    error.code = 500;
                    throw error;
                }

                return { 
                    ...savedBoardTask._doc, 
                    _id: savedBoardTask._id.toString(),
                    createdAt: savedBoardTask.createdAt.toISOString(),
                    updatedAt: savedBoardTask.updatedAt.toISOString() 
                };
            }
        ),

        addTaskComment: combineResolvers(
            isAuthenticated,
            async (parent, { taskId, commentInputs }, { me, models }) => {

                const errors = [];
                if (validator.isEmpty(commentInputs.message) && (!commentInputs.usersMentioned || commentInputs.usersMentioned.length === 0)) {
                    errors.push({ message: "addTaskComment -> Empty comment provided!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid comment inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const boardTask = await models.BoardTask.findById({_id: new ObjectId(taskId)});
                if (!boardTask) {
                    const error = new Error("addTaskComment -> Task no longer exists!");
                    error.code = 500;
                    throw error;
                }
                
                const createdTaskComment = new models.BoardTaskComment({
                    createdBy: me.id,
                    commentLikedBy: [],
                    messageWord: commentInputs
                });

                const savedTaskComment = await createdTaskComment.save();
                if (!savedTaskComment) {
                    const error = new Error("addTaskComment -> Couldn't save the added comment!");
                    error.code = 500;
                    throw error;
                }

                boardTask.comments = [...boardTask.comments, savedTaskComment._id];
                const savedboardTask = await boardTask.save();
                
                if (!savedboardTask) {
                    const error = new Error("addTaskComment -> Couldn't save the edited task!");
                    error.code = 500;
                    throw error;
                }

                return { 
                    ...savedTaskComment._doc, 
                    _id: savedTaskComment._id.toString(),
                    createdAt: savedTaskComment.createdAt.toISOString(),
                    updatedAt: savedTaskComment.updatedAt.toISOString() 
                };
            }
        )


    },

    KanbanBoard: {

        boardMembers: async (kanbanBoard, args, { models, token }) => {
            
            const userIds = kanbanBoard.team.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
                acc.push(...curr.users);
                return [...new Set(acc)];
            }, []);

            const usersData = await models.User.getUsersWithIDs({
                userIds: userIds,
                token: token
            });
            
            if (!usersData.length === 0) {
                throw new UserInputError('No users were found with this id.'); 
            }

            const membersInfo = kanbanBoard.team.reduce((acc, role) => {
                usersData.filter(user => {
                        return role.users.includes(user.id);
                    }).map(user => {
                        acc.push({
                            ...user,
                            role: role.title
                        });
                    });

                return acc; 
            }, []);

            return membersInfo;
        },
    },
}