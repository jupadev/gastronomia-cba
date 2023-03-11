import Parser from "rss-parser";
import { readFile, writeFile } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";

import { ENV } from "../types";

const parser = new Parser<{ [key: string]: unknown }>();

const parseFeeds = async () => {
  try {
    const rss = await parser.parseURL((process.env as ENV).FEED_URL!);
    console.log("RSS feeds fetched");
    return rss;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const storeFeeds = async (rssJson: string) => {
  if (!rssJson) {
    throw new Error("missing param `rssJson`");
  }
  const writeFilePromise = promisify(writeFile);
  await writeFilePromise(path.join(__dirname, "./feeds.json"), rssJson, "utf8");
  console.log("RSS feeds saved!");
};

const readStoredFeeds = async () => {
  const readFilePromise = promisify(readFile);
  console.log("Reading RSS feeds");
  const feedsJson = await readFilePromise(path.join(__dirname, "./feeds.json"));
  return JSON.parse(feedsJson.toString());
};

const generateFeeds = async () => {
  const feedsJson = await parseFeeds();
  await storeFeeds(JSON.stringify(feedsJson));
  console.log("Feeds generated successfuly");
};

export { parseFeeds, storeFeeds, readStoredFeeds, generateFeeds };
