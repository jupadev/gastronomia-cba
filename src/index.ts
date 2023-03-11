import * as dotenv from "dotenv";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { generateFeeds, readStoredFeeds } from "./feeds";
import { cronFeed } from "./feeds/cronFeeds";
import { ENV } from "./types";

dotenv.config();

const env = process.env as ENV;
const { TELEGRAM_API_TOKEN = "" } = env;

const HELP_TEXT = `Bienvenido, te puedo ayudar con los siguientes comandos:
- Para ver las ultimas noticias /news
- Para bucar un local(resto, bar, cafe, etc) /search texto
`;
const bot = new Telegraf(TELEGRAM_API_TOKEN);

bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.help(async (ctx: Context) => {
  ctx.replyWithHTML(HELP_TEXT);
});

bot.command("quit", async (ctx) => {
  await ctx.telegram.leaveChat(ctx.message.chat.id);
  await ctx.leaveChat();
});

bot.command(/news|noticias|ultimo|ultima/, async (ctx) => {
  const feeds = await readStoredFeeds();
  const index = Math.floor(Math.random() * 10);
  const news = feeds.items[index] || feeds.items[0];
  const publishedDate = new Date(news.isoDate);
  const newsBody = news.contentSnippet;

  const content = `${news.title}
${newsBody}
${news.link}
<i>publicado:${publishedDate.toLocaleString("es-AR")}</i>
  `;
  await ctx.replyWithHTML(content);
});

bot.command(/search|buscar|local/, (ctx) =>
  ctx.reply("Perdon, este comando aun no testa listo 👨‍💻")
);

bot.on(message("text"), async (ctx) => {
  await ctx.telegram.sendMessage(ctx.message.chat.id, HELP_TEXT);
});

const start = async () => {
  console.log("initializing bot");
  bot.launch();
  await generateFeeds();
  cronFeed();
};

start();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
