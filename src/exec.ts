export async function handle(a: /* arguments */ {
  sender: string; // user who mentioned
  parent: string; // tweet parent
  conver: string; // conversation id
  unique: string; // unique tweet id
  messag: string[]; // full text of the tweet
}) {
  try {
    if (
      a.messag.includes("ndeposit") &&
      (a.messag[1] == "ndeposit" || a.messag[2] == "ndeposit")
    ) {
      console.log("proceed to dm.");
      await reply(
        "Deposit address sent in DM! (Make sure your DMs are open)",
        a.conver
      );
      await dm(
        "Your XNO deposit address:\njtrkmgblhknmgknkg.mb,fklbfbmf",
        a.sender
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function reply(message: string, convo_id: string) {
  try {
    const res = await fetch(
      `http://localhost:8080/reply?${new URLSearchParams({
        convo_id,
        message,
      }).toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function dm(message: string, user_id: string) {
  try {
    const res = await fetch(
      `http://localhost:8080/dm?${new URLSearchParams({
        user_id,
        message,
      }).toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
  } catch (e) {
    console.error(e);
  }
}
