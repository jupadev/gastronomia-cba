import * as dotenv from "dotenv";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { generateFeeds, readStoredFeeds } from "./feeds";
import { ENV } from "./types";

dotenv.config();

const env = process.env as ENV;
const { TELEGRAM_API_TOKEN = "" } = env;

const HELP_TEXT = `Bienvenido, te puedo ayudar con los siguientes comandos:
- Para ver las ultimas noticias /news
- Para buscar un resto, bar, cafe, etc, /search termino. Por ejemplo /search pizza
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
  ctx.reply("Perdon, este comando aun no esta listo 👨‍💻")
);

bot.on(message("text"), async (ctx) => {
  await ctx.telegram.sendMessage(ctx.message.chat.id, HELP_TEXT);
});

const start = async () => {
  console.log("Getting feeds");
  await generateFeeds();
  console.log("Initializing bot");
  bot.launch();
};

start();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
