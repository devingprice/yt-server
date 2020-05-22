// require('dotenv').config(); //instatiate environment variables

// let CONFIG = {}; //Make this global to use all over the application

// console.log("NODE_ENV is " + process.env.NODE_ENV);

// CONFIG.app = process.env.APP || 'dev';
// CONFIG.port = process.env.PORT || '3001';

// CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
// CONFIG.db_host = process.env.DB_HOST || 'localhost';
// CONFIG.db_port = process.env.DB_PORT || '3306';
// CONFIG.db_name = process.env.DB_NAME || 'ytServer';
// CONFIG.db_user = process.env.DB_USER || 'root';
// CONFIG.db_password = process.env.DB_PASSWORD || 'P@ssw0rd';

// CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
// CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

// module.exports = CONFIG;

const { resolve } = require('path');

switch (process.env.NODE_ENV) {
  case 'test':
    require('dotenv').config({ path: resolve(__dirname, '../.test.env') });
    break;
  default:
    require('dotenv').config();
}

let CONFIG = {
  environment: process.env.NODE_ENV || 'dev',
  app: process.env.APP || 'dev',
  port: process.env.PORT || '3001',
  db_dialect: process.env.DB_DIALECT || 'mysql',
  db_host: process.env.DB_HOST || 'localhost',
  db_port: process.env.DB_PORT || '3306',
  db_name: process.env.DB_NAME || 'ytServer',
  db_user: process.env.DB_USER || 'root',
  db_password: process.env.DB_PASSWORD || 'P@ssw0rd',
  jwt_encryption: process.env.JWT_ENCRYPTION || 'jwt_please_change',
  jwt_expiration: process.env.JWT_EXPIRATION || '10000'
};

module.exports = CONFIG;
