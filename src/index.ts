import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import * as dotenv from "@tinyhttp/dotenv";
import * as bodyParser from "milliparsec";
import axios from "axios";

type ENV = {
  PORT?: string;
  TELEGRAM_API_TOKEN?: string;
  SERVER_URL?: string;
};

// set up the env variables
dotenv.config();
const app = new App();

app.use(bodyParser.json());

const env = process.env as ENV;
const { PORT, TELEGRAM_API_TOKEN, SERVER_URL } = env;

const serverPort = PORT ? parseInt(PORT, 10) : 3000;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}`;
const URI = `/webhook/${TELEGRAM_API_TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}${URI}`;

console.log("URI", URI);
console.log("WEBHOOK_URL", WEBHOOK_URL);

const init = async () => {
  const res = await axios.get(
    `${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}&drop_pending_updates=true`
  );
  if (res.status !== 200) {
    console.error(res);
  }
  console.log(res.data);
};

app
  .use(logger())
  .post(URI, async (req, res) => {
    const {
      chat: { id: chatId },
      text,
    } = req.body?.message || {};
    console.log(chatId, text);
    if (chatId && text) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text,
      });
    }

    return res.status(200).json({ status: "ok" });
  })
  .listen(serverPort, async () => {
    console.log(`server listening on ${serverPort}`);
    await init();
  });
