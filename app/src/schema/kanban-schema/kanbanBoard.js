import { gql } from 'apollo-server-express';
 
export default gql`

    extend type Query {
        kanbanBoard(id: ID!): KanbanBoard!
    }

    extend type Mutation {
        addKanbanBoard(boardInputs: BoardInputs): KanbanBoard!
    }

    input BoardInputs {
        name: String!
        scorecardID: ID!
    }

    type KanbanBoard {
        _id: ID!
        name: String!
        columns: [BoardColumns]!
        boardMembers: [MemberInfo]!
        team: [Role!]!
        createdAt: String!
        updatedAt: String!
    }

    type Role {
        title: String!
        users: [User]!
    }

    type MemberInfo {
        id: ID!,
        username: String!,
        email: String!
        firstname: String!
        lastname: String!
        role: String!
    }

    type BoardColumns {
        _id: ID!
        name: String!
        tasks: [BoardTaskColumn]!
    }

    type BoardTaskColumn {
        _id: ID!
        description: String!,
        taskStatus: String!
        assigned: Boolean!
        assignedTo: [User]
        assignBy: User
        statusChangedTime: String
        comments: [BoardTaskComment]
        detailedDesription: String!
        createdAt: String!
        updatedAt: String!
    }

    type BoardTaskComment {
        _id: ID!
        createdBy: String!
        commentLikedBy:[User]!
        messageWord: MessageWord
    }

    type MessageWord {
        _id: ID!
        message: String!
        usersMentioned: [User]!
    }






`