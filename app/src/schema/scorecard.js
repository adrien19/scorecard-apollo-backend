import { gql } from 'apollo-server-express';
 
export default gql`
  extend type Query {
    scorecards: [Scorecard!]!
    scorecard(id: ID!): Scorecard!
    scorecardsCreatedBy(userId: ID!): [Scorecard!]
    scorecardsPublished(publication: Boolean!): [Scorecard!]!
  }
 
  extend type Mutation {
    createScorecard(scorecardInput: ScorecardInputData): Scorecard!
    updateScorecard(scorecardInput: ScorecardInputData, id: ID!): Scorecard!
    deleteScorecard(id: ID!): Boolean!
  }

  extend type Subscription {
    scorecardCreated: ScorecardCreated!
    scorecardUpdated: ScorecardUpdated!
    scorecardDeleted: ScorecardDeleted!
  }
 
  type ScorecardCreated {
    scorecard: Scorecard!
  }
  type ScorecardUpdated {
    scorecard: Scorecard!
  }
  type ScorecardDeleted {
    scorecard: Scorecard!
  }

  input ScorecardInputData {
    title: String! 
    status: [EnteredStatus]!
    projectStatus: String!
    createdBy: ID!
    team: [EnterdRole]
  }

  input EnteredStatus {
    overall: String!
    net: String!
    cost: String!
    time: String!
  }

  input EnterdRole {
      title: String!
      users: [ID]!
  }
 
  type Scorecard {
    _id: ID!
    title: String!
    status: [Status]!
    projectStatus: String!
    createdBy: User!
    kanbanBoard: KanbanBoard
    publication: Publication!
    createdAt: String!
    updatedAt: String!
  }

  type Status {
    overall: String!
    net: String!
    cost: String!
    time: String!
  }

  type Publication {
    status: Boolean!
    statusChangedAt: String
  }


`;