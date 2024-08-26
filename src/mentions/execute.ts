import { isIdProcessed, markIdAsProcessed } from "../db";

export async function handle(a: /* arguments */ {
  sender: string; // user who mentioned
  parent: string; // tweet parent
  conver: string; // conversation id
  unique: string; // unique tweet id
  messag: string[]; // full text of the tweet
}) {
    if (isIdProcessed(a.conver)) {
        console.log("ID already processed, skipping...");
        return;
      }

  try {
    let amt = parseInt(a.messag[2]);
    if (
      a.messag[1] &&
      a.messag[2] &&
      a.messag[3] &&
      a.messag[4] &&
      a.messag[1] == "send" &&
      !isNaN(amt) &&
      a.messag[3] == "to" &&
      a.messag[4].startsWith("@") &&
      a.messag[4] !== "@tip_xno"
    ) {
      console.log("lets go!");
      // TODO: implement
    }
  } catch (e) {
    console.error(e);
  }

  markIdAsProcessed(a.conver);
}