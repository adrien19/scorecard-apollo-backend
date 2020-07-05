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

        return {
          accessToken: userContent.accessToken,
          refreshToken: userContent.refreshToken
        }
      },

      refreshToken: async (parent, { refreshToken }, { models }) => {

        const newToken = await models.User.getRefreshedToken({
          token: refreshToken
        });

        if (!newToken) {
          throw new UserInputError('Not Authorized.');
        }

        return newToken.accessToken;
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
      fullname: (user, args, { models }) => {
        return `${user.firstname} ${user.lastname}`;
      },
    },
  };