import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const SECRET = 'asdsad12345ddfs324wefsdfdsf';

const app = express();

const addUser = async (req) => {
    const token = req.headers.authorization;

    try {
        const { user } = await jwt.verify(token, SECRET);
        req.user = user;
    } catch (err) {
        console.log(err);
    }

    req.next();
};

app.use(cors('*'));
app.use(addUser);

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
            SECRET,
            user: req.user,
        },
    })),
);

models.sequelize.sync().then(() => app.listen(3000));