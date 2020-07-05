import userResolvers from './user';
import scorecardResolvers from './scorecard';
import kanbanBoardResolvers from './kanban-resolvers/kanbanBoard';
import boardTaskResolvers from './kanban-resolvers/boardTask';
import taskCommentResolvers from './kanban-resolvers/boardTaskComment';
import addBoardColumnResolvers from './kanban-resolvers/boardColumn';

export default [
    userResolvers, 
    scorecardResolvers, 
    kanbanBoardResolvers, 
    boardTaskResolvers, 
    taskCommentResolvers, 
    addBoardColumnResolvers
];