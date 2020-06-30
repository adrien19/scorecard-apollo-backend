import { combineResolvers } from 'graphql-resolvers';

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
                const scorecard = await models.Scorecard.create({
                    
                });
           
                pubsub.publish(EVENTS.SCORECARD.CREATED, {
                scorecardCreated: { scorecard },
                });
        
                return scorecard;
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