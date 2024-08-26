import puppeteer from "puppeteer";
import { init } from "./dm/index.ts";
import { initm } from "./mentions/index.ts";

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox"],
});

const messages = await browser.newPage();
const notifications = await browser.newPage();

await init(messages);
await initm(notifications);
