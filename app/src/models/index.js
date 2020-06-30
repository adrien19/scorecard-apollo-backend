
// let users = {
//     1: {
//       id: '1',
//       username: 'Robin Wieruch',
//       scorecardIds: [1],
//     },
//     2: {
//       id: '2',
//       username: 'Dave Davids',
//       scorecardIds: [2],
//     },
//   };

import * as User from './user'
   
  let scorecards = {
    1: {
      id: '1',
      text: 'Hello World',
      createdById: '1',
    },
    2: {
      id: '2',
      text: 'By World',
      createdById: '2',
    },
  };
   
  export default {
    User,
    scorecards,
  };