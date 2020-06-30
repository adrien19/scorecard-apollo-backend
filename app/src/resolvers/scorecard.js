import { combineResolvers } from 'graphql-resolvers';

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
            (parent, { scorecardInput }, { me, models }) => {
                
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
    }
}