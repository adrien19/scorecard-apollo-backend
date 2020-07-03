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
                    .populate( {path: 'columns.tasks', populate: [
                        { path: 'comments' },
                     ]} )
                    .populate( 'scorecard');

                if (!kanbanBoard) {
                    const error = new Error('Kanboard not found!');
                    error.code = 401;
                    throw error;
                }

                const userIds = kanbanBoard.scorecard.team.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
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
                
                const membersInfo = kanbanBoard.scorecard.team.reduce((acc, role) => {
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
                
                return {
                    ...kanbanBoard._doc, 
                    _id: kanbanBoard._id.toString(),
                    boardMembers: membersInfo,
                    createdAt: kanbanBoard.createdAt.toISOString(),
                    updatedAt: kanbanBoard.updatedAt.toISOString(),
                }
            }
        ),
    },

    Mutation: {
        addKanbanBoard: combineResolvers(
            isAuthenticated,
            async (parent, { boardInputs }, { me, models }) => {

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

                // const parentScorecard = await models.Scorecard.findById({_id: new ObjectId(boardInputs.scorecardID)});

                const createdKanBanBoard = new models.KanbanBoard({
                    name: boardInputs.name,
                    columns: [],
                    scorecard: new ObjectId(boardInputs.scorecardID), // parentScorecard.team,
                });


                const kanbanBoard = await createdKanBanBoard.save();
        
                return { 
                    ...kanbanBoard._doc, 
                    _id: kanbanBoard._id.toString(),
                    createdAt: kanbanBoard.createdAt.toISOString(),
                    updatedAt: kanbanBoard.updatedAt.toISOString() 
                };
            }
        ),
    }

    // KanbanBoard: {
    //     columns: async (kanbanBoard, args, { models, token }) => {
            
    //         const taskIds = kanbanBoard.columns.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
    //             acc.push(...curr.tasks);
    //             return [...new Set(acc)];
    //         }, []);

    //         const taskIdsObjs = taskIds.map(id => new ObjectId(id));

    //         const columnTasksData = await models.BoardTask.find({_id: {$in: taskIdsObjs} }).toArray();
            
    //         if (!columnTasksData.length === 0) {
    //             throw new UserInputError('No users were found with this id.'); 
    //         }
            
    //         return scorecard.columns.map(col => {
    //             return {
    //                 name: col.name,
    //                 tasks: columnTasksData.filter(task => {
    //                     return col.tasks.includes(task._id);
    //                 }).map(task => {
    //                     return {
    //                         ...task,
    //                         _id: task._id.toString(),
    //                         createdAt: task.createdAt.toISOString(),
    //                         updatedAt: task.updatedAt.toISOString(),
    //                     }
    //                 })
    //             }
    //         });
    //     },

    //     boardMembers: async (kanbanBoard, args, { models, token }) => {
    //         const kanbanBoard = await models.KanbanBoard.findById({_id: new ObjectId(id)});
    
    //         if (!userContent.user) {
    //         throw new UserInputError('No user found with this id.'); 
    //         }
            
    //         return {
    //             ...userContent.user,
    //             scorecards: []
    //         }
    //     },
    // },
}