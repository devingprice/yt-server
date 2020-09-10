const models = require('../models');
const Collection = models.Collection;
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');
const aaa = require('adjective-adjective-animal');

const create = async function (req, res) {
    let err, collection;
    let user = req.user;
    let collectionInfo = req.body;

    let attempts = 0;
    const maxTries = 3;
    let uniqueId = null;
    while (true) {
        try {
            uniqueId = await aaa({ adjectives: 2, format: 'camel' });
            const exists = models.sequelize.query(
                `SELECT collections.uniqueid FROM collections WHERE collections.uniqueid = '${uniqueId}' LIMIT 1`,
                { type: models.Sequelize.QueryTypes.SELECT }
            );
            if (exists) {
                break;
            }
            attempts++;
        } catch (e) {
            if (attempts === maxTries - 1) {
                return ReE(res, 'Uniqueid could not be generated', 500);
            }
        }
    }

    collectionInfo.uniqueid = uniqueId;

    [err, collection] = await to(Collection.create(collectionInfo));
    if (err) {
        return ReE(res, err, 422);
    }

    collection.addUser(user); //add to UserCollection
    collection.setOwner(user);

    let collectionJson = collection.toWeb();

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
const get = async function (req, res) {
    let collection = req.collection;

    let channelsArray;
    [err, channelsArray] = await to(collection.getChannels());
    if (err) {
        return ReE(res, 'err finding channels');
    }

    let nested;
    [err, nested] = await to(collection.getChild());
    if (err) {
        return ReE(res, 'err finding nested collections');
    }

    let collectionJson = collection.toWeb();
    collectionJson.channels = channelsArray;
    collectionJson.nested = nested;
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

const order = async function (req, res) {
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

    let userCollections;
    [err, userCollections] = await to(
        models.sequelize.query(
            `SELECT usercollections.CollectionId, usercollections.UserId, usercollections.\`order\`, collections.uniqueid
            FROM usercollections 
            LEFT JOIN collections ON collections.id = usercollections.CollectionId
            WHERE usercollections.UserId = ${enteredUser.id}`,
            { type: models.Sequelize.QueryTypes.SELECT }
        )
    );
    //#region optimized query
    /* 
    this is a more optimized query but just like sequelize isn't taking "FROM usercollections ABRVIATION" 
    it also isn't taking temp tables
        `
        DROP TABLE IF EXISTS tempColl;

        CREATE TEMPORARY TABLE tempColl SELECT * FROM usercollections LIMIT 0;

        INSERT INTO tempColl (\`order\`, CollectionId, UserId)
        SELECT \`order\`, CollectionId, UserId 
        FROM usercollections 
        WHERE usercollections.UserId = '${enteredUserId}'; 

        SELECT tempColl.\`order\`, tempColl.CollectionId, tempColl.UserId, collections.uniqueId
        FROM tempColl
        LEFT JOIN collections ON collections.id = tempColl.CollectionId;

        DROP TEMPORARY TABLE tempColl;
        `
    */
   //#endregion

    const existingIds = userCollections.map((e) => e.CollectionId);

    // TODO, for now I'm just going to overwrite the order and assume every request includes every non null value
    let submittedOrder = req.body.order;

    // filter out submitted for what is in db only
    let buildQuery = submittedOrder
        .filter((item) => existingIds.includes(parseInt(item.collectionId)))
        .map((item) => {
            return `(${
                item.order + ',' + item.collectionId + ',' + enteredUser.id
            })`;
        })
        .join(',');

    let replaceResponse;
    [err, replaceResponse] = await to(
        models.sequelize.query(
            `REPLACE INTO usercollections VALUES ${buildQuery}`
        )
    );
    if (err) {
        console.log(err);
    }

    console.log('affectedRows:' + replaceResponse[0].affectedRows);

    let collOrder;
    [err, collOrder] = await to(
        models.sequelize.query(
            `SELECT usercollections.CollectionId, usercollections.UserId, usercollections.\`order\`, collections.uniqueid
            FROM usercollections 
            LEFT JOIN collections ON collections.id = usercollections.CollectionId
            WHERE usercollections.UserId = ${enteredUser.id}`,
            { type: models.Sequelize.QueryTypes.SELECT }
        )
    );

    /* TODO
    here i need to get the order
    https://stackoverflow.com/questions/48957191/how-do-i-orm-additional-columns-on-a-join-table-in-sequelize
    then compare it to the order I sent up as a [{collectionid, order}] set
    
    I'm going to assume the frontend sends all that have an order given, any not sent are unlisted/unordered
    so I set all the current orders with values to null
        add the orders given to db order
    then select all again and return for confirmation

    *****Will need to check against follows order, and update those as well*******
        may be worth moving to a helper function file since it is touching both controllers
    */

    return ReS(res, {
        order: collOrder,
    });
};

module.exports = { create, getAllForUser, get, update, remove, order };
