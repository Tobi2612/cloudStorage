const Sequelize = require("sequelize");
module.exports = function createUserModel(sequelize) {
    const File = sequelize.define(
        "file",
        {
            file_name: { type: Sequelize.STRING, allowNull: false },
            file_path: { type: Sequelize.STRING, allowNull: false },
            flagged: { type: Sequelize.BOOLEAN, default: false },
            flagged_by: { type: Sequelize.INTEGER, allowNull: true },
            created_by: { type: Sequelize.INTEGER, allowNull: false },
        },
        {}
    );


    return Article;
};
