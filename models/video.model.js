module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define(
        'Video',
        {
            title: DataTypes.STRING,
            description: DataTypes.STRING,
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            thumbnail: DataTypes.STRING,
            channelId: DataTypes.STRING,
            channelTitle: DataTypes.STRING,
            publishTime: DataTypes.STRING,
            publishedAt: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );

    Model.associate = function (models) {
        this.belongsTo(models.Channel);
    };

    // eslint-disable-next-line no-unused-vars
    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
