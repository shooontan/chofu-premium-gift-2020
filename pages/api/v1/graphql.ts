import { ApolloServer } from 'apollo-server-micro';
import { resolvers } from 'src/graphql/resolvers';
import { typeDefs } from 'src/graphql/type-defs';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/v1/graphql' });
