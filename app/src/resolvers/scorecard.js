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
                
                const scorecards = await models.Scorecard.find()
                    .populate('kanbanBoard')
                    .sort({ createdAt: -1 });

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
                const scorecard = await models.Scorecard.findById({_id: new ObjectId(id)})
                    .populate( 
                        {
                            path: 'kanbanBoard', 
                            populate: [
                                { path: 'columns' , populate: [
                                    { path: 'tasks'}
                                ]
                            },
                        ]
                    }
                );

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

        scorecardsCreatedBy: combineResolvers(
            isAuthenticated,
            async (parent, { userId }, { models }) => {
                
                const scorecards = await models.Scorecard.find({createdBy: userId})
                    .populate('kanbanBoard')
                    .sort({ createdAt: -1 });

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

        scorecardsPublished: combineResolvers(
            isAuthenticated,
            async (parent, { publication }, { models }) => {
                
                const scorecards = await models.Scorecard.find({'publication.status': publication})
                    .populate('kanbanBoard')
                    .sort({ createdAt: -1 });

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

                const newKanbanBoard = new models.KanbanBoard({
                    name: scorecardInput.title,
                    columns: [],
                    team: scorecardInput.team,
                });
                
                const savedKanbanBoard = await newKanbanBoard.save();

                if (!savedKanbanBoard) {
                    const error = new Error('createScorecard -> Failed to create board for this scorecard');
                    error.code = 500;
                    throw error;
                }

                const createdScorecard = new models.Scorecard({
                    title: scorecardInput.title,
                    status: scorecardInput.status,
                    projectStatus: scorecardInput.projectStatus,
                    createdBy: me.id, // creator, 
                    kanbanBoard: savedKanbanBoard._id,
                });

                const scorecard = await createdScorecard.save();

                if (!scorecard) {
                    const deletedSavedBoard = await models.KanbanBoard.deleteOne({ _id: savedKanbanBoard._id });
                    const error = new Error('Failed to save scorecard');
                    error.code = 500;
                    throw error;
                }
           
                pubsub.publish(EVENTS.SCORECARD.CREATED, {
                scorecardCreated: { scorecard },
                });
        
                return { 
                    ...scorecard._doc, 
                    _id: scorecard._id.toString(),
                    kanbanBoard: savedKanbanBoard._doc,
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
                scorecard.status = scorecardInput.status;
                scorecard.projectStatus = scorecardInput.projectStatus;
                if (scorecard.publication.status !== scorecardInput.publication.status) {
                    scorecard.publication.statusChangedAt = new Date().toISOString();
                }else{
                    scorecard.publication = scorecardInput.publication;
                }

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
                throw new UserInputError('createdBy -> No user found with this id.'); 
            }
            
            return {
                ...userContent.user,
                scorecards: []
            }
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