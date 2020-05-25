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

//Passport
app.use(passport.initialize());

//Log Env
console.log('Environment:', CONFIG.app);

//DATABASE
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

// CORS
app.use(cors());

app.use('/', routes);

// app.use('/', function(req, res) {
//   res.statusCode = 200; //send the appropriate status code
//   res.json({ status: 'success', message: 'Parcel Pending API', data: {} });
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on('unhandledRejection', error => {
  console.error('Uncaught Error', pe(error));
});
