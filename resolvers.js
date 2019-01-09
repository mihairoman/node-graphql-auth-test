import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { PubSub } from 'graphql-subscriptions';
import { requiresAuth, requiresAdmin } from './permissions';

export const pubSub = new PubSub();
const USER_ADDED = 'USER_ADDED';

export default {
    Subscription: {
        userAdded: {
            subscribe: () => pubSub.asyncIterator(USER_ADDED)
        }
    },
    User: {
        boards: ({ id }, args, { models }) => models.Board.findAll({
            where: {
                owner: id,
            },
        }),
        suggestions: ({ id }, args, { models }) => models.Suggestion.findAll({
            where: {
                creatorId: id,
            },
        }),
    },
    Board: {
        suggestions: ({ id }, args, { models }) => models.Suggestion.findAll({
            where: {
                boardId: id,
            },
        }),
    },
    Suggestion: {
        creator: ({ creatorId }, args, { models }) => models.User.findOne({
            where: {
                id: creatorId,
            },
        }),
    },

    Query: {
        getUsers: (parent, args, { models }) => models.User.findAll(),
        me: (parent, { username }, { models, user }) => {
            if (user) {
                return models.User.findOne({
                    where: {
                        id: user.id
                    }
                });
            } else {
                console.error('User not found');
            }
            return null;
        },
        userBoards: (parent, { owner }, { models }) => models.Board.findAll({
            where: {
                owner
            },
        }),
        userSuggestions: (parent, { creatorId }, { models }) => models.Suggestion.findAll({
            where: {
                creatorId
            },
        }),
    },

    Mutation: {
        updateUser: (parent, { username, newUsername }, { models }) =>
            models.User.update({ username: newUsername }, { where: { username } }),
        deleteUser: (parent, args, { models }) => models.User.destroy({ where: args }),
        createBoard: requiresAuth.createResolver((parent, args, { models }) =>
            models.Board.create(args)
        ),
        createSuggestion: (parent, args, { models }) => models.Suggestion.create(args),
        register: async (parent, args, { models }) => {
            const user = args;
            user.password = await bcrypt.hash(user.password, 12);
            return models.User.create(user);
        },
        login: async (parent, { email, password }, { models, SECRET }) => {
            const user = await models.User.findOne({ where: { email } });
            if (!user) {
                throw new Error('No user with the specified email');
            }

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                throw new Error('Incorrect password');
            }

            const token = jwt.sign(
                { user: _.pick(user, ['id', 'username', 'isAdmin']) },
                SECRET,
                { expiresIn: '1y' }
            );

            return token;
        },
        createUser: async (parent, args, { models }) => {
            const user = args;
            user.password = 'dummy';
            const newUser = await models.User.create(user);
            pubSub.publish(USER_ADDED, { newUser });
            return newUser;
        }
    }
}; 