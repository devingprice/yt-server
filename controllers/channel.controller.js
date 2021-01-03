const models = require('../models');
const Channel = models.Channel;
const LinkedChannel = models.LinkedChannel;
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
    //#region middleware
    let channelId = req.params.channel_id;
    let collectionUid = req.collection.uniqueid;
    let collectionId = req.collection.id;
    let linkedChannel;

    [err, linkedChannel] = await to(
        LinkedChannel.findOne({
            where: { ytId: channelId, CollectionId: collectionId },
        })
    );
    if (err) {
        return ReE(
            res,
            `Error finding Linked Channel with collection uid: ${collectionUid} / id : ${collectionId} & channel id: ${channelId}`
        );
    }

    if (!linkedChannel) {
        return ReE(
            res,
            `Linked Channel not found with collection uid: ${collectionUid} / id : ${collectionId} & channel id: ${channelId}`
        );
    }
    //#endregion

    [err, linkedChannel] = await to(linkedChannel.destroy());
    if (err) {
        return ReE(
            res,
            `Error deleting Linked Channel with collection uid: ${collectionUid} / id : ${collectionId} & channel id: ${channelId}`
        );
    }

    return ReS(res, { message: 'Deleted linked channel' }, 204); //204 has no response body, message won't actually be received
};

module.exports = { create, remove };
