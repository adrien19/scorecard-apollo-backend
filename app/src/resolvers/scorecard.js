import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import pubsub, { EVENTS } from '../subscriptions';
import { isAuthenticated, isScorecardOwner } from './authorization';

export default {
    Query: {
        scorecards: combineResolvers(
            isAuthenticated,
            async (parent, args, { models }) => {
                
                const scorecards = await models.Scorecard.find().sort({ createdAt: -1 })

                return scorecards.map(card => {
                    return {
                        ...card._doc,
                        _id: card._id.toString(),
                        createdAt: card.createdAt.toISOString(),
                        updatedAt: card.updatedAt.toISOString(),
                    };
                });
            }
        ),

        scorecard: combineResolvers(
            isAuthenticated,
            async (parent, { id }, { models }) => {
                const scorecard = await models.Scorecard.findById({_id: new ObjectId(id)});

                if (!scorecard) {
                    const error = new Error('Scorecard not found!');
                    error.code = 401;
                    throw error;
                }

                return {
                    ...scorecard._doc, 
                    _id: scorecard._id.toString(),
                    createdAt: scorecard.createdAt.toISOString(),
                    updatedAt: scorecard.updatedAt.toISOString(),
                }
            }
        ),

    },

    Mutation: {
        createScorecard: combineResolvers(
            isAuthenticated,
            async (parent, { scorecardInput }, { me, models }) => {

                const errors = [];
                if (validator.isEmpty(scorecardInput.title)) {
                    errors.push({ message: "Scorecard title can't be empty!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid Scorecard inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const createdScorecard = new models.Scorecard({
                    title: scorecardInput.title,
                    status: scorecardInput.status,
                    projectStatus: scorecardInput.projectStatus,
                    createdBy: me.id, // creator, 
                    team: scorecardInput.team
                });

                const scorecard = await createdScorecard.save();
           
                pubsub.publish(EVENTS.SCORECARD.CREATED, {
                scorecardCreated: { scorecard },
                });
        
                return { 
                    ...scorecard._doc, 
                    _id: scorecard._id.toString(),
                    createdAt: scorecard.createdAt.toISOString(),
                    updatedAt: scorecard.updatedAt.toISOString() 
                };
            }
        ),

        updateScorecard: combineResolvers(
            isAuthenticated,
            async (parent, { scorecardInput, id }, { me, models }) => {
                const scorecard = await models.Scorecard.findById({_id: new ObjectId(id)});

                if (!scorecard) {
                    const error = new Error('Scorecard not found!');
                    error.code = 401;
                    throw error;
                }

                const errors = [];
                if (validator.isEmpty(scorecardInput.title)) {
                    errors.push({ message: "Scorecard title can't be empty!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid Scorecard inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                scorecard.title = scorecardInput.title;
                scorecard.status = scorecardInput.status,
                scorecard.projectStatus = scorecardInput.projectStatus,
                scorecard.team = scorecardInput.team

                const updatedScorecard = await scorecard.save();

                pubsub.publish(EVENTS.SCORECARD.UPDATED, { // PUSH EVENT TO SUBSCRIBED
                    scorecardUpdated: { updatedScorecard },
                });

                return { 
                    ...updatedScorecard._doc, 
                    _id: updatedScorecard._id.toString(),
                    createdAt: updatedScorecard.createdAt.toISOString(),
                    updatedAt: updatedScorecard.updatedAt.toISOString() 
                };

            }
        ), 

        deleteScorecard: combineResolvers(
            isAuthenticated,
            isScorecardOwner,
            async (parent, { id }, { me, models }) => {
                const scorecard = await models.Scorecard.findById({_id: new ObjectId(id)});

                if (!scorecard) {
                    const error = new Error('Scorecard not found!');
                    error.code = 401;
                    throw error;
                }

                const deletedScorecard = await models.Scorecard.deleteOne({ _id: new ObjectId(id)});

                console.log(deletedScorecard); // SHOW THE RESULT FOR TESTING
                
                const cardDeleted = deletedScorecard.error? false : true;

                if (cardDeleted) {
                    pubsub.publish(EVENTS.SCORECARD.DELETED, { // PUSH EVENT TO SUBSCRIBED
                        scorecardDeleted: { scorecard },
                    });
                }

                return cardDeleted;
            }
        )
    }, 

    Scorecard: {
        createdBy: async (scorecard, args, { models, token }) => {
            const userContent = await models.User.getUserById({
                id: scorecard.createdBy,
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

        team: async (scorecard, args, { models, token }) => {
            
            const userIds = scorecard.team.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
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
            
            return scorecard.team.map(role => {
                return {
                    title: role.title,
                    users: usersData.filter(user => {
                        return role.users.includes(user.id);
                    }).map(user => {
                        return {
                            ...user,
                            scorecards: []
                        }
                    })
                }
            });
        },
    },

    Subscription: {
        scorecardCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.SCORECARD.CREATED),
        },
        scorecardUpdated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.SCORECARD.UPDATED),
        },
        scorecardDeleted: {
            subscribe: () => pubsub.asyncIterator(EVENTS.SCORECARD.DELETED),
        }
    },
}