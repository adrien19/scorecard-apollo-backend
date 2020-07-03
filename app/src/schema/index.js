import { gql } from 'apollo-server-express';
 
import userSchema from './user';
import scorecardSchema from './scorecard';
import kanbanBoardSchema from './kanban-schema/kanbanBoard';
 
const linkSchema = gql`
  type Query {
    _: Boolean
  }
 
  type Mutation {
    _: Boolean
  }
 
  type Subscription {
    _: Boolean
  }
`;
 
export default [linkSchema, userSchema, scorecardSchema, kanbanBoardSchema];