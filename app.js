const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const pe = require('parse-error');
const cors = require('cors');

const routes = require('./routes');
const app = express();

const CONFIG = require('./config/config');

if (CONFIG.environment === 'dev') {
  app.use(logger('dev'));
}
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());

console.log('Environment:', CONFIG.app);

const models = require('./models');
models.sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to SQL database:', CONFIG.db_name);
  })
  .catch(err => {
    console.error('Unable to connect to SQL database:', CONFIG.db_name, err);
  });

if (CONFIG.app === 'test') {
  //Currently emptying on every test that needs it instead of here
  //models.sequelize.sync({ force: true }); //deletes all tables then recreates them
} else {
  //production and development
  models.sequelize.sync(); //creates table if they do not already exist
}

app.use(cors());
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;

process.on('unhandledRejection', error => {
  console.error('Uncaught Error', pe(error));
});
