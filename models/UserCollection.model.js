module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'UserCollection',
        {
            order: {
                type: DataTypes.INTEGER,
                defaultValue: null,
            },
        },
        {}
    );

    return Model;
};
