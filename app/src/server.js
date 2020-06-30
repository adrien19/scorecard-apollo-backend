import cors from 'cors';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
 
import schema from './schema';
import resolvers from './resolvers';
import models from './models';
 
const app = express();
 
app.use(cors());

const getMe = async req => {
  const token = req.headers['authorization'];
  
  if (token) {
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
  context: async ({ req }) => {
    // const me = await getMe(req);
    // console.log('THIS IS THE REQ: ', req.headers['authorization']);
    
    const token = req.headers['authorization'];
    return {
      models,
      token,
      // me,
      // secret: process.env.SECRET
    }
  },
});
 
server.applyMiddleware({ app, path: '/graphql' });
 
app.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});