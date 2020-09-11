module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'Collection',
        {
            name: DataTypes.STRING,
            uniqueid: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            type: DataTypes.INTEGER,
            private: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            timestamps: false,
        }
    );

    Model.associate = function (models) {
        this.belongsTo(models.User, { as: 'owner' });
        this.Users = this.belongsToMany(models.User, {
            through: 'UserCollection',
        });
        this.Channels = this.hasMany(models.Channel);

        this.belongsToMany(models.Collection, {
            through: 'NestedCollection',
            as: 'parent',
            foreignKey: 'parent_id',
        });
        // https://sequelize.org/v3/docs/associations/ may not need extra row for self-association
        this.belongsToMany(models.Collection, {
            through: 'NestedCollection',
            as: 'child',
            foreignKey: 'child_id',
        });
    };

    // eslint-disable-next-line no-unused-vars
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
