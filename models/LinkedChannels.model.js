module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'LinkedChannel',
        {},
        {
            timestamps: false,
        }
    );

    return Model;
};
