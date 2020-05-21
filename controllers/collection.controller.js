const models = require('../models');
const Collection = models.Collection;
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');

const create = async function(req, res) {
  let err, collection;
  let user = req.user;

  let collectionInfo = req.body;

  [err, collection] = await to(Collection.create(collectionInfo));
  if (err) {
    return ReE(res, err, 422);
  }

  collection.addUser(user, { through: { status: 'started' } });

  [err, collection] = await to(collection.save());
  if (err) {
    return ReE(res, err, 422);
  }

  let collectionJson = collection.toWeb();
  collectionJson.users = [{ user: user.id }];

  return ReS(res, { company: collectionJson }, 201);
};
module.exports.create = create;

const getAllForUser = async function(req, res) {
  let enteredUserId, err, enteredUser;
  enteredUserId = req.params.user_id;

  [err, enteredUser] = await to(
    models.User.findOne({ where: { id: enteredUserId } })
  );
  if (err) {
    return ReE(res, 'err finding user');
  }

  if (!enteredUser) {
    return ReE(res, 'user not found with id: ' + enteredUserId);
  }

  //let user = req.user;
  let collections; //err,

  [err, collections] = await to(
    //enteredUser.getCollections({include: [ {association: Collection.Users} ] })
    enteredUser.getCollections({
      include: [
        {
          model: Channel,
          as: 'Channels' //making channels lowercase stops this from working ???
        }
      ]
    })
  );

  let collectionsJson = [];
  for (let i in collections) {
    let collection = collections[i];
    let collectionInfo = collection.toWeb();
    collectionsJson.push(collectionInfo);

    /*let users =  collection.Users;
		let users_info = [];
		for (let j in users){
			let user = users[j];
			// let user_info = user.toJSON();
			//users_info.push({user:user.id});
		}
		//collectionInfo.users = users_info;
		*/
  }

  console.log('c t', collectionsJson);
  return ReS(res, {
    collections: collectionsJson
  });
};
module.exports.getAllForUser = getAllForUser;

//TODO: add this Add_channels_to_output on other functions
const get = function(req, res) {
  let collection = req.collection;

  let collectionJson = collection.toWeb();
  collectionJson.channels = req.channels;
  return ReS(res, { company: collectionJson });
};
module.exports.get = get;

const update = async function(req, res) {
  let err, collection, data;
  collection = req.collection;
  data = req.body;
  collection.set(data);

  [err, collection] = await to(collection.save());
  if (err) {
    return ReE(res, err);
  }
  return ReS(res, { company: collection.toWeb() });
};
module.exports.update = update;

/*
const updateChannels = async function(req, res){
	let err, collection, data;
	collection = req.collection;
	data = req.body;

	//Want to do bulk action
	//data.channels = [{name1},{name2},...]




	[err, collection] = await to(collection.save());
	if(err){
		return ReE(res, err);
	}
	return ReS(res, {company:collection.toWeb()});
	/////////////////////////////////////////////////////////
	let err, collection;
	let user = req.user;

	let collectionInfo = req.body;

	[err, collection] = await to(Collection.create(collectionInfo));
	if(err) return ReE(res, err, 422);

	collection.addUser(user, { through: { status: 'started' }});

	[err, collection] = await to(collection.save());
	if(err) return ReE(res, err, 422);

	let collectionJson = collection.toWeb();
	collectionJson.users = [{user:user.id}];

	return ReS(res, {company:collectionJson}, 201);
};
module.exports.updateChannels = updateChannels;
*/

const remove = async function(req, res) {
  let collection, err;
  collection = req.collection;

  [err, collection] = await to(collection.destroy());
  if (err) {
    return ReE(res, 'error occured trying to delete the collection');
  }

  return ReS(res, { message: 'Deleted collection' }, 204);
};
module.exports.remove = remove;
