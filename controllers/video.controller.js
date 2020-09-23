const models = require('../models');
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');
const { getYoutubeVideosForChannel, bulkCreateVideos } = require('../helper');

const get = async function (req, res) {
    const channelId = req.params.channelId;
    let channel;

    channel = await Channel.findOne({ where: { ytId: channelId } });
    let lastUpdated = channel.videosUpdated;

    const lastUpdatedMS = new Date(lastUpdated);
    const now = new Date();
    const hourInMS = 60 * 60 * 1000;
    if (Math.floor((now - lastUpdatedMS) / hourInMS) >= 72) {
        console.log('update');
        try {
            const ytArr = await getYoutubeVideosForChannel(channel.ytId);
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
        console.log('too recent to update');
    }

    const videos = await channel.getVideos();
    return ReS(res, { lastUpdatedOnDB: lastUpdated, videos });
};

const getMultiple = async (req, res) => {
    const idsString = req.params.ids;
    const ids = idsString.split(',');
    //run get function for multiple ids
    return ReS(res, {});
};

const getCollection = async (req, res) => {
    const collectionId = req.params.collectionId;
    //collection channels get multiple
    return ReS(res, {});
};

module.exports = { get, getMultiple, getCollection };
