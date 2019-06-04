const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');
const HomeController = require('../controllers/home.controller');
const CollectionController = require('../controllers/collection.controller');
const ChannelController = require('../controllers/channel.controller');

const custom = require('./../middleware/custom');

const passport = require('passport');
const path = require('path');

require('./../middleware/passport')(passport);

/* GET home page. */
router.get('/', function(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Parcel Pending API',
    // eslint-disable-next-line camelcase
    data: { version_number: 'v1.0.0' }
  });
});

const JWTAuth = passport.authenticate('jwt', { session: false });

router.post('/users', UserController.create); // C
router.get('/users', JWTAuth, UserController.get); // R
router.put('/users', JWTAuth, UserController.update); // U
router.delete('/users', JWTAuth, UserController.remove); // D
router.post('/users/login', UserController.login);

router.get(
  '/dash',
  passport.authenticate('jwt', { session: false }),
  HomeController.Dashboard
);

router.post('/collection', JWTAuth, CollectionController.create);
router.get('/collections/:user_id', JWTAuth, CollectionController.getAllForUser); // R
router.get('/collection/:collection_id', JWTAuth, custom.collection, CollectionController.get); // R
router.put('/collection/:collection_id', JWTAuth, custom.collection, CollectionController.update); // U
router.delete('/collection/:collection_id', JWTAuth, custom.collection, CollectionController.remove); // D

router.post('/channel/:collection_id', JWTAuth, custom.collection, ChannelController.create); // U
router.delete('/channel/:channel_id', JWTAuth, custom.channel, ChannelController.remove); // D

router.post('/collections', JWTAuth, CollectionController.create);

//********* API DOCUMENTATION **********
router.use(
  '/docs/api.json',
  express.static(path.join(__dirname, '/../public/v1/documentation/api.json'))
);
router.use(
  '/docs',
  express.static(path.join(__dirname, '/../public/v1/documentation/dist'))
);
module.exports = router;
