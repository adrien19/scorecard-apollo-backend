import { gql } from 'apollo-server-express';
 
export default gql`
  extend type Query {
    scorecards: [Scorecard!]!
    scorecard(id: ID!): Scorecard!
  }
 
  extend type Mutation {
    createScorecard(text: String!): Scorecard!
    updateScorecard(text: String!): Scorecard!
    deleteScorecard(id: ID!): Boolean!
  }
 
  type Scorecard {
    id: ID!
    text: String!
    createdBy: User!
  }
`;