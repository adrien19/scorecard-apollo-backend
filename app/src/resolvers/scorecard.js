
export default {
    Query: {
        scorecards: (parent, args, { models }) => {

        },

        scorecard: (parent, { id }, { models }) => {

        },

    },

    Mutation: {
        createScorecard: (parent, { scorecardInput }, { me, models }) => {

        },

        updateScorecard: (parent, { scorecardInput, id }, { me, models }) => {

        }, 

        deleteScorecard: (parent, { scorecardInput, id }, { me, models }) => {

        }
    }, 

    Scorecard: {
        createdBy: (scorecard, args, { models }) => {

        },
    }
}