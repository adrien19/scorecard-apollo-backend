import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import pubsub, { EVENTS } from '../subscriptions';
import { isAuthenticated, isScorecardOwner } from './authorization';

export default {
    Query: {
        scorecards: (parent, args, { models }) => {

        },

        scorecard: (parent, { id }, { models }) => {

        },

    },

    Mutation: {
        createScorecard: combineResolvers(
            isAuthenticated,
            async (parent, { scorecardInput }, { me, models }) => {
                // const scorecard = await models.Scorecard.create({
                    
                // });

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

                // const creator = User.findById(req.id);

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
            (parent, { scorecardInput, id }, { me, models }) => {

            }
        ), 

        deleteScorecard: combineResolvers(
            isAuthenticated,
            isScorecardOwner,
            (parent, { scorecardInput, id }, { me, models }) => {

            }
        )
    }, 

    Scorecard: {
        createdBy: (scorecard, args, { models }) => {

        },
    },

    Subscription: {
        scorecardCreated: {
          subscribe: () => pubsub.asyncIterator(EVENTS.SCORECARD.CREATED),
        },
    },
}