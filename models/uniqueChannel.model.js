module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'UniqueChannel',
        {
            name: DataTypes.STRING,
            ytId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        {
            timestamps: false,
        }
    );

    // eslint-disable-next-line no-unused-vars
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
