/* eslint-disable camelcase */
const Company = require('./../models').Company;
const Collection = require('./../models').Collection;
const Channel = require('./../models').Channel;
const { to, ReE, ReS } = require('../services/util.service');

/*
	Take company_id from url, find in db, check if user can access, return obj if it can
 */
let company = async function(req, res, next) {
  let company_id, err, company;
  company_id = req.params.company_id;

  [err, company] = await to(Company.findOne({ where: { id: company_id } }));
  if (err) {
    return ReE(res, 'err finding company');
  }

  if (!company) {
    return ReE(res, 'Company not found with id: ' + company_id);
  }
  let user, users_array, users;
  user = req.user;
  [err, users] = await to(company.getUsers());

  users_array = users.map(obj => String(obj.user));

  if (!users_array.includes(String(user._id))) {
    return ReE(
      res,
      'User does not have permission to read app with id: ' + app_id
    );
  }

  req.company = company;
  next();
};
module.exports.company = company;

let collection = async function(req, res, next) {
  let collection_id, err, collection;
  collection_id = req.params.collection_id;

  [err, collection] = await to(
    Collection.findOne({ where: { id: collection_id } })
  );
  if (err) {
    return ReE(res, 'err finding collection');
  }

  if (!collection) {
    return ReE(res, 'collection not found with id: ' + collection_id);
  }
  let user, users_array, users;
  user = req.user;
  [err, users] = await to(collection.getUsers());

  users_array = users.map(obj => String(obj.user));

  if (!users_array.includes(String(user._id))) {
    return ReE(
      res,
      'User does not have permission to read app with id: ' + app_id
        ? app_id
        : null
    );
  }

  //TODO: move this out of this function, shouldnt be doing multiple things
  //make it an internal function at top of collection controller
  let channels_array;
  [err, channels_array] = await to(collection.getChannels());
  if (err) {
    return ReE(res, 'err finding channels');
  }
  if (!channels_array) {
    return ReE(res, 'channels not found in collection id: ' + collection_id);
  }

  req.channels = channels_array;
  //collection.channels = channels_array;
  //console.log(collection.channels);
  req.collection = collection;
  next();
};
module.exports.collection = collection;

let channel = async function(req, res, next) {
  let channel_id, err, channel;
  channel_id = req.params.channel_id;

  [err, channel] = await to(Channel.findOne({ where: { id: channel_id } }));
  if (err) {
    return ReE(res, 'err finding channel');
  }

  if (!channel) {
    return ReE(res, 'channel not found with id: ' + channel_id);
  }

  //get channel this belongs to
  [err, collection] = await to(channel.getCollection());
  if (err) {
    return ReE(res, 'err finding collection');
  }
  if (!collection) {
    return ReE(res, 'collection not found from channel');
  }

  //check if user has access to that collection
  let user, users_array, users;
  user = req.user;
  [err, users] = await to(collection.getUsers());

  users_array = users.map(obj => String(obj.user));

  if (!users_array.includes(String(user._id))) {
    return ReE(
      res,
      'User does not have permission to read app with id: ' + app_id
        ? app_id
        : null
    );
  }

  console.log(channel.toWeb());
  req.channel = channel;
  next();
};
module.exports.channel = channel;

/*
let collections = async function (req, res, next) {
	let collection_id, err, collection;
	collection_id = req.params.collection_id;

	[err, collection] = await to(Collection.findOne({where:{id:collection_id}}));
	if(err) return ReE(res, "err finding collection");

	if(!collection) return ReE(res, "collection not found with id: "+collection_id);
	let user, users_array, users;
	user = req.user;
	[err, users] = await to(collection.getUsers());

	users_array = users.map(obj=>String(obj.user));

	if(!users_array.includes(String(user._id))) return ReE(res, "User does not have permission to read app with id: "+app_id);

	req.collection = collection;
	next();
};
module.exports.collections = collections;
	*/
