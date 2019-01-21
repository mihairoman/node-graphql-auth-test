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
import passport from 'passport';
import dotenv from 'dotenv';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

import batchSuggestions from './dataloader/suggestions';
import { getGoogleStrategy, googleAuth } from './auth/googleAuth';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

dotenv.config();

const app = express();

passport.use(getGoogleStrategy(models));
app.use(passport.initialize());

//link which triggers the google authentication proces
app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.me' }));
//callback link which is called after authentication process is done(same as in the googleStrategy)
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Successful authentication, redirect home.
        console.log('AUTH WAS GOO!');
        res.send('AUTH WAS GOOD!');
    });

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