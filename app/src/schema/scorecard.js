import { gql } from 'apollo-server-express';
 
export default gql`
  extend type Query {
    scorecards: [Scorecard!]!
    scorecard(id: ID!): Scorecard!
  }
 
  extend type Mutation {
    createScorecard(scorecardInput: ScorecardInputData): Scorecard!
    updateScorecard(text: String!): Scorecard!
    deleteScorecard(id: ID!): Boolean!
  }

  extend type Subscription {
    scorecardCreated: ScorecardCreated!
  }
 
  type ScorecardCreated {
    scorecard: Scorecard!
  }

  input ScorecardInputData {
    title: String! 
    status: [EnteredStatus]!
    projectStatus: String!
    createdBy: String!
    team: EnteredTeam
  }

  input EnteredStatus {
    overall: String!
    net: String!
    cost: String!
    time: String!
  }

  input EnterdRole {
      title: String!
      users: [String]!
  }

  input EnteredTeam {
      roles: [ 
          EnterdRole
      ]
  }
 
  type Scorecard {
    _id: ID!
    title: String!
    status: [Status]!
    projectStatus: String!
    createdBy: User!
    team: Team
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

  type Role {
      title: String!
      users: [User]!
  }

  type Team {
      roles: [ 
          Role
      ]
  }

  type Publication {
    status: Boolean!
    statusChangedAt: String
  }


`;