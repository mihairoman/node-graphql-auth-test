import Sequelize from 'sequelize';

const sequelize = new Sequelize(
    'test_graphql_db',
    'test_graphql_admin',
    'pass',
    {
        host: 'localhost',
        dialect: 'postgres',
    },
);

const db = {
    User: sequelize.import('./user'),
    Board: sequelize.import('./board'),
    Suggestion: sequelize.import('./suggestion'),
    GoogleAuth: sequelize.import('./googleAuth'),
    LocalAuth: sequelize.import('./localAuth')
};

Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

export default db;