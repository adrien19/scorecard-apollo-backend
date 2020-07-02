import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';
import { ObjectId } from 'mongodb';
 
export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');


export const isScorecardOwner = async (parent, { id }, { models, me }) => {
        const scorecard = await models.Scorecard.findById({_id: new ObjectId(id)});

        if (!scorecard) {
          const error = new Error('Scorecard not found!');
          error.code = 401;
          throw error;
        }

        if (scorecard.createdBy !== me.id) {
            throw new ForbiddenError('Not authenticated as owner.');
        }

    return skip;
};


export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { roles } }) =>
      roles.some(role => role.name.toLocaleLowerCase() === 'ADMIN'.toLocaleLowerCase())
        ? skip
        : new ForbiddenError('Not authorized as admin.'),
);