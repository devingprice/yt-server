module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define(
    'Collection',
    {
      name: DataTypes.STRING
    },
    {
      timestamps: false
    }
  );

  Model.associate = function(models) {
    this.Users = this.belongsToMany(models.User, {
      through: 'UserCollection'
    });
    this.Channels = this.hasMany(models.Channel);
  };

  Model.prototype.toWeb = function(pw) {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
