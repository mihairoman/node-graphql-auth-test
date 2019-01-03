import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

const SECRET = 'asdsad12345ddfs324wefsdfdsf';
const PORT = 3000;
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const app = express();

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
}))

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: { models, SECRET } }));

models.sequelize.sync().then(() => app.listen(PORT));