'use strict';
const bcrypt 			= require('bcrypt-nodejs');
const bcrypt_p 			= require('bcrypt-nodejs-as-promised');
const jwt           	= require('jsonwebtoken');
const {TE, to}          = require('../services/util.service');
const CONFIG            = require('../config/config');

module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('User', {
        first     : DataTypes.STRING,
        last      : DataTypes.STRING,
        email     : {type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: {msg: "Email Phone number invalid."} }},
        phone     : {type: DataTypes.STRING, allowNull: true, unique: true, validate: { len: {args: [7, 20], msg: "Phone number invalid, too short."}, isNumeric: { msg: "not a valid phone number."} }},
        password  : DataTypes.STRING,
    }, {
			timestamps:false
		});

    Model.associate = function(models){
        this.Companies = this.belongsToMany(models.Company, {through: 'UserCompany'});
        this.Collections = this.belongsToMany(models.Collection, {through: 'UserCollection'})
    };
    
    Model.beforeSave(async (user, options) => {
        let err;

        console.log('before save ran')
        if (user.changed('password')){
            let salt, hash;
           
            [err, salt] = await to(bcrypt_p.genSalt(10));
            if(err) TE(err.message, true);
            
            
            //created a function to ignore bcrypt_p.hash
            async function bcryptHash(bPass, bSalt) { 
                return await new Promise((resolve, reject) => {
                    bcrypt.hash(bPass, bSalt, null, function (err, hash) {
                        if (err) reject(err)
                        resolve(hash)
                    });
                })
            }
            

            //had to alter function, docs say bcrypt_p only needs 2 args but it requires all 4
            // ACTUALLY DOESNT WORK AT ALL. lib is using its own dependency wrong
            /*[err, hash] = await to(bcrypt_p.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return err;
                }
                return hash
            }));*/
            [err, hash] = await to(bcryptHash(user.password, salt));   //using my function
            
            if(err) TE(err.message, true);

            user.password = hash;
        }
    });
    /* */
    Model.prototype.comparePassword = async function (pw) {
        let err, pass
        if(!this.password) TE('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password, function (err, hash) {
            if (err) {
                return err;
            }
            return hash

        }));
        if(err) TE(err);

        if(!pass) TE('invalid password');

        return this;
    }

    Model.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return "Bearer "+jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    };

    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
