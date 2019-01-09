import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import extractUserFromJwt from './middleware/extractUserFromJwt';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const app = express();

app.use(cors('*'));
app.use(extractUserFromJwt);

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