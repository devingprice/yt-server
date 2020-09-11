const models = require('../models');
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');

const create = async function (req, res) {
    let err, channel;
    let collection = req.collection;

    let channelInfo = req.body;

    channel = await Channel.findOne({ where: { ytId: channelInfo.ytId } }).then(
        async (found) => {
            if (found === null) {
                return await Channel.create(channelInfo);
            } else {
                return found;
            }
        }
    );

    channel.addCollection(collection);

    let channelJson = channel.toWeb();

    return ReS(res, { channel: channelJson }, 201);
};

const remove = async function (req, res) {
    let channel, err;
    channel = req.channel;
    [err, channel] = await to(channel.destroy());
    if (err) {
        return ReE(res, 'error occured trying to delete the channel');
    }

    return ReS(res, { message: 'Deleted channel' }, 204);
};

module.exports = { create, remove };
