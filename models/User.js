const Sequelize = require("sequelize");
module.exports = function createUserModel(sequelize) {
    const User = sequelize.define(
        "user",
        {
            full_name: { type: Sequelize.STRING, allowNull: false },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { isEmail: true },
            },
            password: { type: Sequelize.STRING, allowNull: false },
            role: {
                type: Sequelize.STRING,
            },
        },
        {}
    );

    return User;
};