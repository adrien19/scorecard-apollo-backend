import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';
 
export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');


export const isScorecardOwner = async (parent, { id }, { models, me }) => {
        const scorecard = await models.Scorecard.findByPk(id, { raw: true });

        if (scorecard.userId !== me.id) {
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