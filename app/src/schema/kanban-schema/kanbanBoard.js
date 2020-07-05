import { gql } from 'apollo-server-express';
 
export default gql`

    extend type Query {
        kanbanBoard(id: ID!): KanbanBoard!
        boardTask(id: ID!): BoardTaskColumn!
    }

    extend type Mutation {
        updateKanbanBoard(id: ID!, boardInputs: BoardInputs): KanbanBoard!

        addBoardTask(columnId: ID!, taskInputs: TaskInputs): BoardTaskColumn!
        assignUserToTask(userId: ID!, taskId: ID!): BoardTaskColumn!

        addBoardColumn(boardId: ID!, columnInputs: ColumnInputs): BoardColumn!
        addTaskComment(taskId: ID!, commentInputs: CommentInputs): TaskComment!

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
        comments: [CommentInputs]
        detailedDesription: String
    }

    input CommentInputs {
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
        createdBy: User!
        tasks: [BoardTaskColumn]!
    }

    type BoardTaskColumn {
        _id: ID!
        description: String!
        taskStatus: String!
        createdBy: User!
        assigned: Boolean!
        assignedTo: [MemberInfo]
        assignBy: User
        statusChangedTime: String
        comments: [TaskComment]
        detailedDesription: String
        createdAt: String!
        updatedAt: String!
    }

    type TaskComment {
        _id: ID!
        createdBy: User!
        commentLikes: Int!
        commentLikedBy:[User]!
        messageWord: MessageWord
    }

    type MessageWord {
        message: String!
        usersMentioned: [User]!
    }






`