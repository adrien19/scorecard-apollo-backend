import { gql } from 'apollo-server-express';
 
export default gql`
  extend type Query {
    users: [User!]
    user(id: Int!): User
    me: User
  }

  extend type Mutation {
    signUp(
      username: String!
      email: String!
      firstname: String!
      lastname: String!
      password: String!
      roles:[String]!
    ): userDataSourceConfirm!
  }

  extend type Mutation {
    signIn(
      username: String!
      password: String!
    ): TokenInfo!
  }

  extend type Mutation {
    logout(
      refreshToken: String!
    ): userDataSourceConfirm!
  }

  extend type Mutation {
    refreshToken(
      refreshToken: String!
    ): String!
  }

  extend type Mutation {
    deleteUser(id: Int!): userDataSourceConfirm!
  }
 
  type TokenInfo {
    accessToken: String!
    refreshToken: String!
    loggedInUserInfo: UserInfo!
  }

  type UserInfo {
    id: ID!
    username: String!
    email: String!
    firstname: String!
    lastname: String!
    roles: [String!]!
  }


  type userDataSourceConfirm {
    confirmMessage: String!
  }
 
  type User {
    id: ID!
    username: String!
    email: String!
    firstname: String!
    lastname: String!
    fullname: String!
  }
`;