import userResolvers from './user';
import scorecardResolvers from './scorecard';
import kanbanBoardResolvers from './kanban-resolvers/kanbanBoard';
import boardTask from './kanban-resolvers/boardTask';

export default [userResolvers, scorecardResolvers, kanbanBoardResolvers, boardTask];