const models = require('../models');
const Collection = models.Collection;
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');

const create = async function (req, res) {
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

    return ReS(res, { collection: collectionJson }, 201);
};

const getAllForUser = async function (req, res) {
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

    let collections;

    [err, collections] = await to(
        enteredUser.getCollections({
            include: [
                {
                    model: Channel,
                    as: 'Channels',
                },
            ],
        })
    );

    let collectionsJson = [];
    for (let i in collections) {
        let collection = collections[i];
        let collectionInfo = collection.toWeb();
        collectionsJson.push(collectionInfo);
    }

    return ReS(res, {
        collections: collectionsJson,
    });
};

//TODO: add this Add_channels_to_output on other functions
const get = function (req, res) {
    let collection = req.collection;

    let collectionJson = collection.toWeb();
    collectionJson.channels = req.channels;
    return ReS(res, { collection: collectionJson });
};

const update = async function (req, res) {
    let err, collection, data;
    collection = req.collection;
    data = req.body;
    collection.set(data);

    [err, collection] = await to(collection.save());
    if (err) {
        return ReE(res, err);
    }
    return ReS(res, { collection: collection.toWeb() });
};

const remove = async function (req, res) {
    let collection, err;
    collection = req.collection;

    [err, collection] = await to(collection.destroy());
    if (err) {
        return ReE(res, 'error occured trying to delete the collection');
    }

    return ReS(res, { message: 'Deleted collection' }, 204);
};

module.exports = { create, getAllForUser, get, update, remove };
