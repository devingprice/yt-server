const models = require('../models');
const Channel = models.Channel;
const { to, ReE, ReS } = require('../services/util.service');
const { recursive, getChannelDetails, bulkCreateVideos } = require('../helper');

const create = async function (req, res) {
    let err, channel;
    let collection = req.collection;

    let channelInfo = req.body;

    channel = await Channel.findOne({ where: { ytId: channelInfo.ytId } }).then(
        async (found) => {
            if (found === null) {
                // const confirmedChannel = await getYoutubeFeeds(channelInfo.ytId);
                const confirmedChannel = await getChannelDetails(
                    channelInfo.ytId
                );

                if (
                    confirmedChannel === null ||
                    confirmedChannel.items.length === 0
                ) {
                    return ReE(
                        res,
                        'The Youtube API did not return a channel for the submitted ID so channel could not be created in database.'
                    );
                }
                console.log(confirmedChannel.items[0]);
                confirmedChannelParsed = {
                    ytId: confirmedChannel.items[0].id,
                    name: confirmedChannel.items[0].snippet.title,
                    thumbnail:
                        confirmedChannel.items[0].snippet.thumbnails.default
                            .url,
                    views: confirmedChannel.items[0].statistics.viewCount,
                    subs: confirmedChannel.items[0].statistics.subscriberCount,
                    videos: confirmedChannel.items[0].statistics.videoCount,
                };
                const createdChannel = await Channel.create({
                    ...confirmedChannelParsed,
                    statsUpdated: models.sequelize.literal('CURRENT_TIMESTAMP'),
                });

                try {
                    const ytArr = await recursive(createdChannel.ytId);
                    const success = await bulkCreateVideos(ytArr);
                    console.log(
                        `Creating bulk videos was a ${
                            success ? 'success' : 'failure'
                        }`
                    );
                    createdChannel.update({
                        videosUpdated: models.sequelize.literal(
                            'CURRENT_TIMESTAMP'
                        ),
                    });
                } catch (err) {
                    console.log(err);
                }

                return createdChannel;
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
