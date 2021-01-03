/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');
const CollectionController = require('../controllers/collection.controller');
const ChannelController = require('../controllers/channel.controller');
const FollowController = require('../controllers/follow.controller');
const VideoController = require('../controllers/video.controller');

const custom = require('./../middleware/custom');
const passport = require('passport');
const path = require('path');

require('./../middleware/passport')(passport);

router.get('/', function(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Parcel Pending API',
    // eslint-disable-next-line camelcase
    data: { version_number: 'v1.0.0' }
  });
});

const JWTAuth = passport.authenticate('jwt', { session: false });

router.post('/users', UserController.create);
router.get('/users', JWTAuth, UserController.get);
router.put('/users', JWTAuth, UserController.update);
router.delete('/users', JWTAuth, UserController.remove);
router.post('/users/login', UserController.login);

router.post('/collection', JWTAuth, CollectionController.create);
router.get('/collections/:user_id', JWTAuth, CollectionController.getAllForUser);
router.get('/collection/:collection_id', custom.collection, CollectionController.get); //JWTAuth, 
router.put('/collection/:collection_id', JWTAuth, custom.collection, CollectionController.update);
router.delete('/collection/:collection_id', JWTAuth, custom.collection, CollectionController.remove);

router.post('/channel/:collection_id', JWTAuth, custom.collection, ChannelController.create);
router.delete('/channel/:channel_id/:collection_id', JWTAuth, custom.channel, ChannelController.remove);

router.put('/order/:user_id', JWTAuth, CollectionController.order);
router.post('/follow/:parentId/:childId', JWTAuth, FollowController.create);
router.delete('/follow/:parentId/:childId', JWTAuth, FollowController.remove);

router.post('/collections', JWTAuth, CollectionController.create);

router.get('/videos/collection/:collectionId', VideoController.getCollection);
router.get('/videos/multiple/:ids', VideoController.getMultiple);
router.get('/videos/:channelId', VideoController.get);

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
