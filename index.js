const RssParser = require("rss-parser");
const json = require("./valid_feeds.json"); // assuming your JSON file is an array of objects
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

const today = new Date().toISOString().split("T")[0];
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
        description: item.summary || item.contentSnippet,
        image: item.enclosure ? item.enclosure.url : null,
        category: feed.category || "General",
        author: item.author,
        pubDate: item.pubDate,
      }));
    return feeds || [];
  } catch (error) {
    console.log(`Error parsing RSS feed: ${feed.rssUrl} - ${error.message}`);
    return [];
  }
}

async function getTodayNews() {
  const feeds = await Promise.all(json.map((feed) => getNews(feed)));
  return valid_feeds;
  return feeds.flat();
}

app.get("/list", async (req, res) => {
  return res.send(json || "No feeds found");
});

app.get("/today", async (req, res) => {
  const news = await getTodayNews();
  return res.send(news || "No news found");
});

app.get("/get-news", async (req, res) => {
  const { source } = req.query;
  const news = json.filter((feed) => feed.source === source)[0];
  const result = await getNews(news);
  return res.send(result || "No news found");
});
app.use(express.static(path.join(__dirname, "dist")));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
