module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'NestedCollection',
        {},
        {
            timestamps: false,
        }
    );

    return Model;
};
