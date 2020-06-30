import { PubSub } from 'apollo-server';
 


import * as SCORECARD_EVENTS from './scorecard';
 
export const EVENTS = {
  SCORECARD: SCORECARD_EVENTS,
};


export default new PubSub();