const RssParser = require("rss-parser");
const fs = require("fs");
const json = require("./feeds.json"); // assuming your JSON file is an array of objects
const express = require("express");
const app = express();
const port = 3000;

const today = new Date().toISOString().split("T")[0];
let todayFeeds = [];
let failedFeeds = [];

async function getNews(feed) {
  if (!feed.rssUrl || !feed.sourceLink) return;
  try {
    const rssData = await new RssParser().parseURL(feed.rssUrl);
    const feeds = rssData.items
      .filter(
        (item) => new Date(item.pubDate).toISOString().slice(0, 10) === today
      )
      .map((item) => ({
        source: feed.source,
        title: item.title,
        link: item.link,
        description: item.summary,
        pubDate: item.pubDate,
      }));
    todayFeeds = [...todayFeeds, ...feeds];
  } catch (error) {
    failedFeeds.push({ url: feed.rssUrl, error: error.message });
    console.log(`Error parsing RSS feed: ${feed.rssUrl} - ${error.message}`);
  }
}

async function getTodayNews() {
  await Promise.all(json.map((feed) => getNews(feed)));
  fs.promises.writeFile(`${today}-news.json`, JSON.stringify(todayFeeds));
  fs.promises.writeFile(`${today}-failed.json`, JSON.stringify(failedFeeds));
  console.log(
    `Total Feeds: ${json.length}, Success: ${(
      ((json.length - failedFeeds.length) / json.length) *
      100
    ).toFixed(2)}%, Failed: ${(
      (failedFeeds.length / json.length) *
      100
    ).toFixed(2)}%`
  );
  console.log(
    `Total Feeds: ${json.length}, Failed ${(
      (failedFeeds.length / json.length) *
      100
    ).toFixed(2)}`
  );
  console.log(`Today's news saved in ${today}-news.json: ${todayFeeds.length}`);
  console.log(`Today's news failed to fetch: ${failedFeeds.length}`);
}

getTodayNews();
// Start the Express server and set an interval to run getTodayNews() daily at midnight
setInterval(() => {
  getTodayNews(); // Run getTodayNews() every day at midnight
}, 1000 * 60 * 60 * 24); // Every 24 hours (1 day)

app.get("/today", (req, res) => {
  const today = new Date().toISOString().substr(0, 10); // Get today's date in YYYY-MM-DD format
  fs.readFile(`${today}-news.json`, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).send({ error: "File not found" });
    } else {
      const jsonFeeds = JSON.parse(data);
      res.json(jsonFeeds);
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
