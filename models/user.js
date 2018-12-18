export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        usename: DataTypes.STRING
    });

    return User;
};