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
                            path: 'columns.tasks', 
                            populate: [
                                { path: 'comments' },
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