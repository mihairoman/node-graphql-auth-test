import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import extractUserFromJwt from './middleware/extractUserFromJwt';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import DataLoader from 'dataloader';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

import batchSuggestions from './dataloader/suggestions';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const app = express();

app.use(cors('*'));
app.use(extractUserFromJwt(models));

app.use(
    '/graphiql',
    graphiqlExpress({
        endpointURL: '/graphql',
    }),
);

app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress(req => ({
        schema,
        context: {
            models,
            SECRET: process.env.SECRET,
            user: req.user,
            suggestionLoader: new DataLoader(keys => batchSuggestions(keys, models))
        },
    })),
);

const server = createServer(app);

models.sequelize.sync().then(() => {
    server.listen(process.env.PORT, () => {
        new SubscriptionServer({
            execute,
            subscribe,
            schema: schema
            ,
        }, {
                server: server,
                path: '/subscriptions',
            });
    });
});