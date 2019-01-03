import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

export default {
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
        getUser: (parent, { username }, { models }) => models.User.findOne({
            where: {
                username
            }
        }),
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
        createBoard: (parent, args, { models }) => models.Board.create(args),
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
                { user: _.pick(user, ['id', 'username']) },
                SECRET,
                { expiresIn: '1y' }
            );

            return token;
        }
    }
}; 