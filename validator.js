const RssParser = require("rss-parser");
const fs = require("fs");

function writeValidFeedsToJson(validFeeds) {
  return fs.writeFileSync("valid-feeds.json", JSON.stringify(validFeeds));
}

async function validateAndFilterRssFeeds(feedData) {
  const validFeeds = await feedData.filter(async (feed) => {
    try {
      const data = await new RssParser().parseURL(feed.rssUrl);
      if (data) return true;
      return false;
    } catch (error) {
      return false;
    }
  });
  return writeValidFeedsToJson(validFeeds);
}

const feeds = require("./feeds.json");
validateAndFilterRssFeeds(feeds).then((result) => {
  console.log(`${result.length} valid feeds`);
});

// const filteredFeeds = require("./valid-feeds.json");
// // get total length of both feeds
// console.log(`Total number of feeds: ${filteredFeeds.length}`);

// // get total length of valid feeds
// let totalValidFeedLength = 0;
// for (const feed of filteredFeeds) {
//   if (feed.rssUrl) {
//     totalValidFeedLength++;
//   }
// }
// console.log(`Total number of valid feeds: ${totalValidFeedLength}`);

// // get total length of invalid feeds
// let totalInvalidFeedLength = 0;
// for (const feed of filteredFeeds) {
//   if (!feed.rssUrl) {
//     totalInvalidFeedLength++;
//   }
// }
// console.log(`Total  number of invalid feeds: ${totalInvalidFeedLength}`);
