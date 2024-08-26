import WS from "ws";
import { accountInfo, generateWork, processBlock } from "../nano/rpc";
import { block, tools } from "nanocurrency-web";
import { accountExists, getAccountByAddress } from "../db/index.ts";
import { sendDM } from "../scripts.ts";
import BigNumber from "bignumber.js";

let ws: any;

function connectWebSocket() {
  ws = new WS(
    "wss://nodes.nanswap.com/ws/?ticker=XNO&api=yournanswapapi"
  );

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        action: "subscribe",
        topic: "confirmation",
      })
    );
  };

  ws.onmessage = async (msg: any) => {
    const data_json = JSON.parse(msg.data);
    if (
      data_json.topic === "confirmation" &&
      data_json.message !== undefined &&
      data_json.message.block.subtype === "send"
    ) {
      const account = data_json.message.block.link_as_account;

      if (accountExists(account)) {
        const user = getAccountByAddress(account);
        const privateKey = user.private;

        const account_info = await accountInfo(account);
        let data = {
          toAddress: account,
          transactionHash: data_json.message.hash,
          amountRaw: data_json.message.amount,
          walletBalanceRaw: "0",
          representativeAddress:
            "nano_1tk8h3yzkibbsti8upkfa69wqafz6mzfzgu8bu5edaay9k7hidqdunpr4tb6", // RSNANO Node
          frontier:
            "0000000000000000000000000000000000000000000000000000000000000000",
          work: "",
        };

        if (account_info.error === "Account not found") {
          data.work = await generateWork(user.public);
        } else {
          data.walletBalanceRaw = account_info.balance;
          data.representativeAddress = account_info.representative;
          data.frontier = account_info.frontier;
          data.work = await generateWork(account_info.frontier);
        }
        const signedBlock = block.receive(data, privateKey);
        await processBlock(signedBlock, "receive");
        sendDM(
          `New XNO deposit received!\n\n${new BigNumber(
            tools.convert(data.amountRaw, "RAW", "NANO")
          ).toFixed(5)} Ӿ was just deposited to your address.\n\n𝘶𝘴𝘦 !𝘣𝘢𝘭𝘢𝘯𝘤𝘦 𝘵𝘰 𝘴𝘦𝘦 𝘯𝘦𝘸 𝘣𝘢𝘭𝘢𝘯𝘤𝘦`,
          user.id
        );
      }
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed, reconnecting...");
    setTimeout(connectWebSocket, 1000);
  };

  ws.onerror = (err: any) => {
    console.error("WebSocket encountered an error:", err.message);
    ws.close();
  };
}

connectWebSocket();
