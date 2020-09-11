const cheerio = require('cheerio');
const got = require('got');
const convert = require('xml-js');

async function fetchHTML(url) {
    try {
        const response = await got.get(url);
        return response.body;
    } catch (error) {
        console.log(error.response.body);
    }
}

module.exports.getYoutube = async function getYoutube(ytId) {
    //UCoookXUzPciGrEZEXmh4Jjg
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytId}`;
    const body = await fetchHTML(url);
    const $ = cheerio.load(body, { xmlMode: true });

    const converted = convert.xml2json($.xml(), { compact: true, spaces: 2 });
    const json = JSON.parse(converted);

    if (ytId !== json.feed['yt:channelId']._text) {
        return null;
    }
    const title = json.feed.id._text;

    return { title, ytId };
};
