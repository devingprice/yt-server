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
            CollectionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Collections',
                    key: 'id',
                    // unique: 'compositeIndex',
                    primaryKey: true,
                },
            },
        },
        {
            timestamps: false,
        }
    );

    Model.associate = function (models) {
        this.Collections = this.belongsTo(models.Collection);
    };

    // eslint-disable-next-line no-unused-vars
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
