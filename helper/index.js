const cheerio = require('cheerio');
const got = require('got');
const convert = require('xml-js');

const models = require('../models');
const Video = models.Video;

async function fetchHTML(url) {
    try {
        const response = await got.get(url);
        return response.body;
    } catch (error) {
        console.log(error.response.body);
    }
}

const getYoutubeFeeds = async function getYoutubeFeeds(ytId) {
    //UCoookXUzPciGrEZEXmh4Jjg
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`;
    const body = await fetchHTML(url);
    const $ = cheerio.load(body, { xmlMode: true });

    const converted = convert.xml2json($.xml(), { compact: true, spaces: 2 });
    const json = JSON.parse(converted);
    console.log(json);

    if (ytId !== json.feed['yt:channelId']._text) {
        return null;
    }
    const title = json.feed.title._text;

    return { title, ytId };
};

const getChannelDetails = async function (ytId) {
    const url = 'https://www.googleapis.com/youtube/v3/channels';
    const ytApiKey = process.env.ytApiKey;
    try {
        const response = await got(url, {
            responseType: 'json',
            resolveBodyOnly: true,
            searchParams: {
                key: ytApiKey,
                part: 'snippet,statistics',
                id: ytId,
            },
        });
        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
};

function recursive(channelId, pageToken = '', accumulator = []) {
    return new Promise((resolve, reject) =>
        getYoutubeVideosForChannel(channelId, pageToken)
            .then((response) => {
                if (!response) {
                    throw Error('No response for channel videos');
                }
                console.log(response);
                accumulator = accumulator.concat(...response.items);

                if (response.nextPageToken) {
                    console.log('next page');
                    recursive(channelId, response.nextPageToken, accumulator)
                        .then(resolve)
                        .catch(reject);
                } else {
                    console.log('no next page');
                    resolve(accumulator);
                }
            })
            .catch(reject)
    );
}

async function getYoutubeVideosForChannel(channelId, pageToken = '') {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const ytApiKey = process.env.ytApiKey;
    try {
        const response = await got(url, {
            responseType: 'json',
            resolveBodyOnly: true,
            searchParams: {
                key: ytApiKey,
                part: 'snippet',
                channelId: channelId,
                order: 'date',
                type: 'video',
                maxResults: 50,
                pageToken: pageToken,
            },
        });
        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function parseYtToModelVideos(arr) {
    return arr.map((yt) => {
        return {
            title: yt.snippet.title,
            description: yt.snippet.description,
            id: yt.id.videoId,
            thumbnail: yt.snippet.thumbnails.default.url,
            channelId: yt.snippet.channelId,
            channelTitle: yt.snippet.channelTitle,
            publishTime: yt.snippet.publishTime,
            publishedAt: yt.snippet.publishedAt,
            ChannelYtId: yt.snippet.channelId,
        };
    });
}

async function bulkCreateVideos(arr) {
    const modelFormatted = parseYtToModelVideos(arr);
    return await Video.bulkCreate(modelFormatted)
        .then(() => {
            return true;
        })
        .catch((err) => {
            console.log(err);
            return false;
        });
}

module.exports = {
    getYoutubeVideosForChannel,
    recursive,
    getChannelDetails,
    getYoutubeFeeds,
    bulkCreateVideos,
};
