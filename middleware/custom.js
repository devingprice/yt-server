/* eslint-disable camelcase */
const Collection = require('./../models').Collection;
const Channel = require('./../models').Channel;
const { to, ReE } = require('../services/util.service');

//find collection where collection_uid = uniqueid
let collection = async function (req, res, next) {
    let collection_uid, err, collection;
    collection_uid = req.params.collection_uid;

    [err, collection] = await to(
        Collection.findOne({ where: { uniqueid: collection_uid } })
    );
    if (err) {
        return ReE(res, 'Error finding collection: ' + collection_uid);
    }

    if (!collection) {
        return ReE(res, 'Collection not found with id: ' + collection_uid);
    }

    req.collection = collection;
    next();
};
module.exports.collection = collection;

//find channel where ytId = ytId
let channel = async function (req, res, next) {
    let channel_id, err, channel;
    channel_id = req.params.channel_id;

    [err, channel] = await to(Channel.findOne({ where: { ytId: channel_id } }));
    if (err) {
        return ReE(res, 'Error finding channel: ' + channel_id);
    }

    if (!channel) {
        return ReE(res, 'Channel not found with id: ' + channel_id);
    }

    // console.log(channel.toWeb());
    req.channel = channel;
    next();
};
module.exports.channel = channel;

// let privateCollection = async function (req, res, next) {
//     let collection_uid, err, collection;
//     collection_uid = req.params.collection_uid;

//     [err, collection] = await to(
//         Collection.findOne({ where: { uniqueid: collection_uid } })
//     );
//     if (err) {
//         return ReE(res, 'Error finding collection: ' + collection_uid);
//     }

//     if (!collection) {
//         return ReE(res, 'Collection not found with id: ' + collection_uid);
//     }

//     // todo may remove this, not sure if it will stop public viewing
//     // let user, users_array, users;
//     // user = req.user;
//     // [err, users] = await to(collection.getUsers());

//     // users_array = users.map((obj) => String(obj.user));

//     // if (!users_array.includes(String(user._id))) {
//     //     return ReE(
//     //         res,
//     //         'User does not have permission to read app with id: ' + app_id
//     //             ? app_id
//     //             : null
//     //     );
//     // }

//     req.collection = collection;
//     next();
// };
// module.exports.privateCollection = privateCollection;
