import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import { isAuthenticated, isScorecardOwner } from '../authorization';

export default {
    Query: {
        boardTask: combineResolvers(
            isAuthenticated,
            async (parent, { id }, { models, token }) => {
                const boardTask = await models.BoardTask.findById({_id: new ObjectId(id)}).populate('comments');

                if (!boardTask) {
                    const error = new Error('Task not found!');
                    error.code = 401;
                    throw error;
                }

                return {
                    ...boardTask._doc, 
                    _id: boardTask._id.toString(),
                    createdAt: boardTask.createdAt.toISOString(),
                    updatedAt: boardTask.updatedAt.toISOString()
                }
            }
        ),
    },

    Mutation: {

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
                    createdBy: me.id,
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


        assignUserToTask: combineResolvers(
            isAuthenticated,
            async (parent, { userId, taskId }, { me, models }) => {
                const boardTask = await models.BoardTask.findById({_id: new ObjectId(taskId)}).populate('comments');

                if (!boardTask) {
                    const error = new Error('assignUserToTask -> Task not found!');
                    error.code = 401;
                    throw error;
                }

                const userAlreadyAssigned = boardTask.assignedTo.some(assigneeId => assigneeId === userId)? true : false; 
                if (userAlreadyAssigned) {
                    const error = new Error('assignUserToTask -> User already assigned!');
                    error.code = 401;
                    throw error;
                }

                if (!boardTask.assignedTo) {
                    boardTask.assignedTo = [userId];
                    boardTask.assigned = true;
                } else {
                    boardTask.assignedTo = [...boardTask.assignedTo, userId];
                    boardTask.assigned = true;
                }

                const savedboardTask = await boardTask.save();
                if (!savedboardTask) {
                    const error = new Error('assignUserToTask -> Enable to save the task!');
                    error.code = 500;
                    throw error;
                }

                return { 
                    ...savedboardTask._doc, 
                    _id: savedboardTask._id.toString(),
                    createdAt: savedboardTask.createdAt.toISOString(),
                    updatedAt: savedboardTask.updatedAt.toISOString() 
                };
            }

        ),
    },


    BoardTask: {
        createdBy: async (boardTask, args, { models, token }) => {
            const userContent = await models.User.getUserById({
                id: boardTask.createdBy,
                token: token
            });

            if (!userContent.user) {
                throw new UserInputError('No user found with this id.'); 
            }
            
            return {
                ...userContent.user,
                scorecards: []
            }
        },

        assignedTo: async (boardTask, args, { models, token }) => {
            
            return await boardTask.assigned? (async () => {
                const userIds = boardTask.assignedTo.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
                    acc.push(curr);
                    return [...new Set(acc)];
                }, []);

                const usersData = await models.User.getUsersWithIDs({
                    userIds: userIds,
                    token: token
                });
                
                if (!usersData.length === 0) {
                    throw new UserInputError('No users were found with this id.'); 
                }

                const membersInfo = boardTask.assignedTo.reduce((acc, assigneeId) => {
                    usersData.filter(user => {
                            return assigneeId === user.id;
                        }).map(user => {
                            acc.push({
                                ...user,
                                fullname: `${user.firstname} ${user.lastname}`,
                                role: ""
                            });
                        });

                    return acc; 
                }, []);

                return membersInfo;

            })(boardTask, models, token) : [];
        },
        
    }
}