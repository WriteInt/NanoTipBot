import cookies from "../../cookies.json";
import { handle_dm } from "./execute";
import { Page } from "puppeteer";

export const init = async (page: Page) => {
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  );
  page.on("response", async (res) => {
    if (res.url().includes("/i/api/1.1/dm/user_updates.json")) {
      try {
        const messages = (await res.json()).user_events.entries;

        for (const message of messages) {
          const { id, sender_id: sender, text } = message.message.message_data;
          if (id && sender && text) handle_dm(id, sender, text);
        }
      } catch {
        // :(
      }
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
      value: cookies.ct0,
      domain: "x.com",
    },
    { name: "night_mode", value: cookies.night_mode, domain: "x.com" }
  );

  await page.goto("https://x.com/messages");
};
