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

        await updateVideosForChannel(channel).then(null, (err) =>
            console.log(err)
        );
    } else {
        console.log('too recent to update ' + channel.ytId);
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
    const ids = idsString.split(',').map((item) => item.trim());

    const foundChannels = await getMultipleChannels(ids);
    // .then(
    //     updateIfNecessary,
    //     (err) => console.log(err)
    // );
    console.log(foundChannels);

    //at the moment I don't want the api to create channels off of a mass request
    //it could cause me to hit my api limits much faster, i'll just ignore them for now
    //const newChannels = channelsNotFound(ids, foundChannels);

    await updateIfNecessary(foundChannels);

    let videos = await Promise.all(
        foundChannels.map(async (channel) => {
            const videos = await channel.getVideos();
            let toWeb = channel.toWeb();
            toWeb.videos = videos;
            return toWeb;
        })
    );

    return ReS(res, videos);
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

//#region helper
function channelsNotFound(arrIds, arrChannels) {
    const foundChannels = arrChannels.map((channel) => channel.ytId);
    return arrIds.filter((id) => {
        return foundChannels.indexOf(id) === -1;
    });
}

async function getMultipleChannels(arr) {
    return models.Channel.findAll({
        where: {
            ytId: arr,
        },
    });
}

async function updateIfNecessary(arrChannels) {
    const now = new Date();
    const hourInMS = 60 * 60 * 1000;

    const channelsToUpdate = arrChannels.filter((channel) => {
        let lastUpdated = channel.videosUpdated;
        const lastUpdatedMS = new Date(lastUpdated);
        if (Math.floor((now - lastUpdatedMS) / hourInMS) >= 72) {
            return true;
        } else {
            console.log('too recent to update ' + channel.ytId);
            return false;
        }
    });
    return await Promise.all(
        channelsToUpdate.map(async (channel) => {
            return updateVideosForChannel(channel);
        })
    );
}

async function updateVideosForChannel(channel) {
    return new Promise(async (resolve, reject) => {
        try {
            //only first page, not recursive
            //videos only recursive fetched on channel creation
            const ytSearchObj = await getYoutubeVideosForChannel(channel.ytId);
            const success = await bulkCreateVideos(ytSearchObj.items);
            channel.update({
                videosUpdated: models.sequelize.literal('CURRENT_TIMESTAMP'),
            });
            console.log(
                `Creating bulk videos for ${channel.ytId} was a ${
                    success ? 'success' : 'failure'
                }`
            );
            resolve(true);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
//#endregion

module.exports = { get, getMultiple, getCollection };
