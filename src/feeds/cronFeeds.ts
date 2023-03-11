import nodeCron from "node-cron";

import { generateFeeds } from ".";
import { ENV } from "../types";

const feedUpdateFreq = (process.env as ENV).FEED_UPDATE_FREQ || "* */12 * * *";

const cronFeed = () => {
  console.log("cronjob scheduled ⏰");
  nodeCron.schedule(feedUpdateFreq, function cronjobFeed() {
    console.log("Cronjob generating feeds");
    generateFeeds();
  });
};

export { cronFeed };
