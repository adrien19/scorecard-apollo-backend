import cors from 'cors';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import http from 'http';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';

const app = express();
 
app.use(cors());

const getMe = async req => {
  let token = req.headers['authorization'];
  
  if (token) {
    token = token.split(' ')[1];
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (err) {
      throw new AuthenticationError('Your session expired. Please Sign in again.');
    }
  }
}
 
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models
      }
    }

    if (req) {
      const me = await getMe(req);
      const token = req.headers['authorization'];
      return {
        models,
        token,
        me,
        // secret: process.env.SECRET
      }
    }
  },
});
 
server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
 
httpServer.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});