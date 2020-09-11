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
        this.Channels = this.belongsToMany(models.Channel, {
            through: 'LinkedChannel',
        });

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

        if (json.UserCollection) {
            json.order = json.UserCollection.order;
            delete json.UserCollection;
        }
        if (
            json.Channels &&
            typeof json.Channels === 'array' &&
            json.Channels.length > 0
        ) {
            json.Channels.forEach((e) => delete e.LinkedChannel);
        }

        return json;
    };

    return Model;
};
