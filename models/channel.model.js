const {TE, to}              = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
	var Model = sequelize.define('Channel', {
		name: DataTypes.STRING
	});

	/* In sequelize docs:
	 Country.hasMany(City, {foreignKey: 'countryCode', sourceKey: 'isoCode'});
	 City.belongsTo(Country, {foreignKey: 'countryCode', targetKey: 'isoCode'});
	but im not sure I need this if I just have has many on parent, testing now
	 */
	Model.associate = function(models){
		this.Collections = this.belongsTo(models.Collection);
	};


	Model.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return Model;
};