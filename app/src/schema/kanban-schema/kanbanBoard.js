import { gql } from 'apollo-server-express';
 
export default gql`

    extend type Query {
        kanbanBoard(id: ID!): KanbanBoard!
    }

    extend type Mutation {
        updateKanbanBoard(id: ID!, boardInputs: BoardInputs): KanbanBoard!
        addBoardTask(columnId: ID!, taskInputs: TaskInputs): BoardTaskColumn!
        addBoardColumn(boardId: ID!, columnInputs: ColumnInputs): BoardColumn!
    }

    input BoardInputs {
        name: String
        columns: [ColumnInputs]
    }

    input ColumnInputs {
        name: String!
        tasks: [TaskInputs]!
    }

    input TaskInputs {
        description: String!
        taskStatus: String!
        assigned: Boolean
        assignedTo: [ID]
        assignBy: ID
        statusChangedTime: String
        comments: [TaskComment]
        detailedDesription: String
    }

    input TaskComment {
        createdBy: String!
        commentLikedBy:[ID]
        messageWord: MessageText
    }

    input MessageText {
        message: String!
        usersMentioned: [ID]
    }


    type KanbanBoard {
        _id: ID!
        name: String!
        columns: [BoardColumn]!
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

    type BoardColumn {
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
        detailedDesription: String
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