import { combineResolvers } from 'graphql-resolvers';
import validator from 'validator';
import { ObjectId } from 'mongodb';

import { isAuthenticated, isScorecardOwner } from '../authorization';

export default {

    Query: {
        taskComment: combineResolvers(
            isAuthenticated,
            async (parent, { id }, { models, token }) => {
                const taskComment = await models.BoardTaskComment.findById({_id: new ObjectId(id)});

                if (!taskComment) {
                    const error = new Error('Comment not found!');
                    error.code = 401;
                    throw error;
                }

                return {
                    ...taskComment._doc, 
                    _id: taskComment._id.toString(),
                    createdAt: taskComment.createdAt.toISOString(),
                    updatedAt: taskComment.updatedAt.toISOString()
                }
            }
        ),
    },

    Mutation: {
        addTaskComment: combineResolvers(
            isAuthenticated,
            async (parent, { taskId, commentInputs }, { me, models }) => {

                const errors = [];
                if (validator.isEmpty(commentInputs.message) && (!commentInputs.usersMentioned || commentInputs.usersMentioned.length === 0)) {
                    errors.push({ message: "addTaskComment -> Empty comment provided!" });
                }

                if (errors.length !== 0) {
                    const error = new Error('Invalid comment inputs');
                    error.data = errors;
                    error.code = 422;
                    throw error;
                }

                const boardTask = await models.BoardTask.findById({_id: new ObjectId(taskId)});
                if (!boardTask) {
                    const error = new Error("addTaskComment -> Task no longer exists!");
                    error.code = 500;
                    throw error;
                }
                
                const createdTaskComment = new models.BoardTaskComment({
                    createdBy: me.id,
                    commentLikedBy: [],
                    messageWord: commentInputs
                });

                const savedTaskComment = await createdTaskComment.save();
                if (!savedTaskComment) {
                    const error = new Error("addTaskComment -> Couldn't save the added comment!");
                    error.code = 500;
                    throw error;
                }

                boardTask.comments = [...boardTask.comments, savedTaskComment._id];
                const savedboardTask = await boardTask.save();
                
                if (!savedboardTask) {
                    const error = new Error("addTaskComment -> Couldn't save the edited task!");
                    error.code = 500;
                    throw error;
                }

                return { 
                    ...savedTaskComment._doc, 
                    _id: savedTaskComment._id.toString(),
                    createdAt: savedTaskComment.createdAt.toISOString(),
                    updatedAt: savedTaskComment.updatedAt.toISOString() 
                };
            }
        )
    },

    TaskComment: {
        messageWord: async (taskComment, { id }, { models, token }) => {

            const usersMentioned = taskComment.messageWord.usersMentioned;
            const message = taskComment.messageWord.message;

            const userIds = (usersMentioned.lenght !== 0)? usersMentioned.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
                acc.push(curr);
                return [...new Set(acc)];
            }, []) : [];

            const usersData = (usersMentioned.lenght !== 0)? await models.User.getUsersWithIDs({
                userIds: userIds,
                token: token
            }) : [];
            
            const messageWord = {
                'message': message,
                'usersMentioned': usersData
            }
        
            return messageWord;
        },

        commentLikedBy: async (taskComment, { id }, { models, token }) => {

            const commentLikedBy = taskComment.commentLikedBy;

            const userIds = (commentLikedBy.lenght !== 0)? commentLikedBy.reduce( (acc, curr) => { // get all userIds and remove duplicates with 'new Set()'
                acc.push(curr);
                return [...new Set(acc)];
            }, []) : [];

            const usersData = (commentLikedBy.lenght !== 0)? await models.User.getUsersWithIDs({
                userIds: userIds,
                token: token
            }) : [];
        
            return usersData;
        },
    }
}