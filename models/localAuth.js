export default (sequelize, DataTypes) => {
    const LocalAuth = sequelize.define('local_auth', {
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING
    });

    LocalAuth.associate = (models) => {
        LocalAuth.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return LocalAuth;
};