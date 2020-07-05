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
    },

    KanbanBoard: {

        boardMembers: async (kanbanBoard, args, { models, token }) => {
            
            const userIds = (kanbanBoard.team.length !== 0)? kanbanBoard.team.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
                acc.push(...curr.users);
                return [...new Set(acc)];
            }, []) : [];

            const usersData = (kanbanBoard.team.length !== 0)? await models.User.getUsersWithIDs({
                userIds: userIds,
                token: token
            }) : [];
            
            const membersInfo = (kanbanBoard.team.length !== 0)? kanbanBoard.team.reduce((acc, role) => {
                usersData.filter(user => {
                        return role.users.includes(user.id);
                    }).map(user => {
                        acc.push({
                            ...user,
                            fullname: `${user.firstname} ${user.lastname}`,
                            role: role.title
                        });
                    });

                return acc; 
            }, []) : [];

            return membersInfo;
        },
    },

}