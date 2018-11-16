const express 			= require('express');
const router 			= express.Router();

const UserController 	= require('../controllers/user.controller');
const CompanyController = require('../controllers/company.controller');
const HomeController 	= require('../controllers/home.controller');
const CollectionController = require('../controllers/collection.controller');
const ChannelController = require('../controllers/channel.controller');

const custom 	        = require('./../middleware/custom');

const passport      	= require('passport');
const path              = require('path');


require('./../middleware/passport')(passport);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({status:"success", message:"Parcel Pending API", data:{"version_number":"v1.0.0"}})
});


router.post(    '/users',           UserController.create);                                                    // C
router.get(     '/users',           passport.authenticate('jwt', {session:false}), UserController.get);        // R
router.put(     '/users',           passport.authenticate('jwt', {session:false}), UserController.update);     // U
router.delete(  '/users',           passport.authenticate('jwt', {session:false}), UserController.remove);     // D
router.post(    '/users/login',     UserController.login);

router.post(    '/companies',             passport.authenticate('jwt', {session:false}), CompanyController.create);                  // C
router.get(     '/companies',             passport.authenticate('jwt', {session:false}), CompanyController.getAll);                  // R

router.get(     '/companies/:company_id', passport.authenticate('jwt', {session:false}), custom.company, CompanyController.get);     // R
router.put(     '/companies/:company_id', passport.authenticate('jwt', {session:false}), custom.company, CompanyController.update);  // U
router.delete(  '/companies/:company_id', passport.authenticate('jwt', {session:false}), custom.company, CompanyController.remove);  // D

router.get('/dash', passport.authenticate('jwt', {session:false}),HomeController.Dashboard);

router.post(    '/collection', passport.authenticate('jwt', {session:false}), CollectionController.create);
router.get(     '/collections/:user_id', passport.authenticate('jwt', {session:false}), CollectionController.getAllForUser);                  // R
router.get(     '/collection/:collection_id', passport.authenticate('jwt', {session:false}), custom.collection, CollectionController.get);     // R
router.put(     '/collection/:collection_id', passport.authenticate('jwt', {session:false}), custom.collection, CollectionController.update);  // U
router.delete(  '/collection/:collection_id', passport.authenticate('jwt', {session:false}), custom.collection, CollectionController.remove);  // D

router.post(     '/channel/:collection_id', passport.authenticate('jwt', {session:false}), custom.collection, ChannelController.create);  // U
router.delete(   '/channel/:channel_id', passport.authenticate('jwt', {session:false}), custom.channel, ChannelController.remove);  // D

router.post(    '/collections',             passport.authenticate('jwt', {session:false}), CollectionController.create);

//********* API DOCUMENTATION **********
router.use('/docs/api.json',            express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs',                     express.static(path.join(__dirname, '/../public/v1/documentation/dist')));
module.exports = router;
