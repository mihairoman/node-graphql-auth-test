export default (sequelize, DataTypes) => {
    const GooglAuth = sequelize.define('google_auth', {
        googleId: DataTypes.STRING,
        displayName: DataTypes.STRING
    });

    GooglAuth.associate = (models) => {
        GooglAuth.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return GooglAuth;
};