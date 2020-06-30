import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';

import { isAdmin } from './authorization';

export default {
    Query: {
      users: (parent, args, { models }) => {

      },

      user: async (parent, { id }, { models, token }) => {
        const userContent = await models.User.getUserById({
          id,
          token
        });

        if (!userContent.user) {
          throw new UserInputError('No user found with this id.'); 
        }
        
        return {
          ...userContent.user,
          scorecards: []
        }
      },

      me: async (parent, args, { models, token }) => {
        const userContent = await models.User.getCurrentUser({
          token
        });

        return {
          ...userContent.user,
          scorecards: []
        }
      },
    },

    Mutation: {
      signUp: async (parent, { username, email, firstname, lastname, password, roles }, { models }) => {
        const confirmation = await models.User.createUser({
          username,
          email,
          firstname,
          lastname,
          password,
          roles
        });

        const userCreatedMessage = confirmation.userCreated? "User successfully created" : " Failed to create user";
        
        return {
          confirmMessage: userCreatedMessage
        }
      },

      signIn: async (parent, { username, password }, { models }) => {

        const userContent = await models.User.signIn({
          username,
          password
        });

        if (!userContent) {
          throw new UserInputError('No user found with this username.');
        }

        console.log(userContent);
        

        return {
          accessToken: userContent.accessToken,
          refreshToken: userContent.refreshToken
        }
      },

      deleteUser: combineResolvers(
          isAdmin,
          async (parent, { id }, { models }) => {
          const confirmation = await models.User.deleteUser({
            id
          });

          console.table(confirmation); // check returned value!
          const userDeletedMessage = confirmation.userDeleted? "User successfully deleted" : " Failed to delete user";
          

          return {
            confirmMessage: userDeletedMessage
          }
        }
      ),

    },
   
    User: {
      scorecards: (user, args, { models }) => {

      },
    },
  };