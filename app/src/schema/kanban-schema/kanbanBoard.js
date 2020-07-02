import { gql } from 'apollo-server-express';
 
export default gql`

    extend type Query {
        kanbanBoard(id: ID!): KanbanBoard!
    }

    type KanbanBoard {
        _id: ID!
        name: String!
        columns: [BoardColumns]!
        boardMembers: [User]!
        createdAt: String!
        updatedAt: String!
    }

    type BoardColumns {
        
    }






`