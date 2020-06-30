import cors from 'cors';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import http from 'http';
import mongoose from 'mongoose';

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
      
      if (!req.headers['refresh']) {
        throw new AuthenticationError('Your session expired. Please Sign in again.');
      }
      return null;
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
 
mongoose.connect(process.env.DATABASE_LINK, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true } ).then((result) => {

  httpServer.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
  
}).catch(err => {
  console.log('Unable to connect to database', err);
});