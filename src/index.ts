import puppeteer from "puppeteer";
import { handle } from "./exec";
import cookies from "../cookies.json";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage(); 

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  );

  page.on("response", async (response) => {
    if (response.url().includes("/i/api/2/notifications/all.json")) {
      try {
        const res = (await response.json()).globalObjects.tweets;
        const tweet = res[Object.keys(res)[0]];
        await handle({
          sender: tweet.user_id_str,
          parent: tweet.in_reply_to_user_id_str,
          conver: tweet.conversation_id_str,
          unique: tweet.id_str,
          messag: tweet.full_text.split(" "),
        });
      } catch { }
    }
  });

  await page.goto("https://x.com/");
  await page.setCookie(
    {
      name: "auth_token",
      value: cookies.auth_token,
      domain: "x.com",
    },
    {
      name: "ct0",
      value:
        cookies.ct0,
      domain: "x.com",
    },
    { name: "night_mode", value: cookies.night_mode, domain: "x.com" }
  );
  await page.goto("https://x.com/notifications");
})();
