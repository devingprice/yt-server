module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'Channel',
        {
            name: DataTypes.STRING,
            ytId: {
                type: DataTypes.STRING,
                allowNull: false,
                // unique: 'compositeIndex',
                primaryKey: true,
            },
        },
        {
            timestamps: false,
        }
    );

    Model.associate = function (models) {
        this.Collections = this.belongsToMany(models.Collection, {
            through: 'LinkedChannel',
            foreignKey: 'ytId',
        });
    };

    // eslint-disable-next-line no-unused-vars
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();

        delete json.LinkedChannel;

        return json;
    };

    return Model;
};
