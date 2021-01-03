const models = require('../models');
const Channel = models.Channel;
const Collection = models.Collection;
const { ReE, ReS } = require('../services/util.service');
const { getYoutubeVideosForChannel, bulkCreateVideos } = require('../helper');

async function getVideosForChannelIfNecessary(channel) {
    let lastUpdated = channel.videosUpdated;

    const lastUpdatedMS = new Date(lastUpdated);
    const now = new Date();
    const hourInMS = 60 * 60 * 1000;
    if (Math.floor((now - lastUpdatedMS) / hourInMS) >= 72) {
        console.log(`fetching videos for channel ${channel.ytId} from youtube`);
        try {
            const ytArr = await getYoutubeVideosForChannel(channel.ytId); //only first page, not recursive
            const success = await bulkCreateVideos(ytArr);
            console.log(
                `Creating bulk videos was a ${success ? 'success' : 'failure'}`
            );
            channel.update({
                videosUpdated: models.sequelize.literal('CURRENT_TIMESTAMP'),
            });
        } catch (err) {
            console.log(err);
        }
    } else {
        //console.log('too recent to update');
    }
}

const get = async function (req, res) {
    const channelId = req.params.channelId;
    if (
        channelId === 'null' ||
        channelId === 'undefined' ||
        channelId === '' ||
        !channelId
    ) {
        return ReE(res, 'Invalid channelId sent to video controller', 400);
    }
    let channel;

    channel = await Channel.findOne({ where: { ytId: channelId } });
    getVideosForChannelIfNecessary(channel);

    const videos = await channel.getVideos();
    const returnData = {
        lastUpdatedOnDB: channel.lastUpdated,
        videos,
        channelId: channel.ytId,
    };
    return ReS(res, returnData);
};

const getMultiple = async (req, res) => {
    const idsString = req.params.ids;
    const ids = idsString.split(',');
    //run get function for multiple ids
    return ReS(res, {});
};

const getCollection = async (req, res) => {
    const collectionId = req.params.collectionId;
    if (
        collectionId === 'null' ||
        collectionId === 'undefined' ||
        collectionId === '' ||
        !collectionId
    ) {
        return ReE(res, 'Invalid collectionId sent to video controller', 400);
    }
    let collection;
    collection = await Collection.findOne({ where: { id: collectionId } });
    let channels = await collection.getChannels();
    console.log(channels);
    return ReS(res, {});
};

module.exports = { get, getMultiple, getCollection };
