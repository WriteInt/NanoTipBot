import { createOrGetWallet, isIdProcessed, markIdAsProcessed } from "../db";
import {
  generateWork,
  getBalance,
  getRepresentative,
  processBlock,
  accountInfo,
} from "../nano/rpc";
import { sendDM } from "../scripts";
import { tools, block } from "nanocurrency-web";
import BigNumber from "bignumber.js";

export async function handle_dm(id: string, sender: string, text: string) {
  const wallet = await createOrGetWallet(sender);
  const address = wallet.address;

  if (isIdProcessed(id)) {
    console.log("ID already processed, skipping...");
    return;
  }

  // TODO: if id handled, return

  if (text == "!deposit") {
    console.log("sending address...");
    await sendDM(
      `̲𝚈̲̲𝚘̲̲𝚞̲̲𝚛̲ ̲𝙽̲̲𝙰̲̲𝙽̲̲𝙾̲ ̲𝙳̲̲𝚎̲̲𝚙̲̲𝚘̲̲𝚜̲̲𝚒̲̲𝚝̲ ̲𝙰̲̲𝚍̲̲𝚍̲̲𝚛̲̲𝚎̲̲𝚜̲̲𝚜̲:\n\n${address}\n\n𝘯𝘰𝘵𝘦: 𝘧𝘰𝘳 𝘢𝘯 𝘦𝘢𝘴𝘪𝘦𝘳 𝘧𝘰𝘳𝘮𝘢𝘵 𝘵𝘰 𝘤𝘰𝘱𝘺, 𝘵𝘳𝘺 !𝘢𝘥𝘥𝘳𝘦𝘴𝘴`,
      sender
    );
  } else if (text == "!balance") {
    try {
      console.log("checking balance...");
      const balance = await getBalance(address);
      await sendDM(
        `̲𝚈̲̲𝚘̲̲𝚞̲̲𝚛̲ ̲𝙽̲̲𝙰̲̲𝙽̲̲𝙾̲ ̲𝙱̲̲𝚊̲̲𝚕̲̲𝚊̲̲𝚗̲̲𝚌̲̲𝚎̲:\n\nBalance: ${new BigNumber(
          tools.convert(balance.balance, "RAW", "NANO")
        ).toFixed(5)} Ӿ\nPending: ${new BigNumber(
          tools.convert(balance.receivable, "RAW", "NANO")
        ).toFixed(5)} Ӿ\n\n𝘯𝘰𝘵𝘦: 𝘥𝘰 𝘯𝘰𝘵 𝘩𝘰𝘭𝘥 𝘭𝘢𝘳𝘨𝘦 𝘣𝘢𝘭𝘢𝘯𝘤𝘦𝘴 𝘰𝘯 𝘵𝘩𝘪𝘴 𝘵𝘪𝘱𝘣𝘰𝘵`,
        sender
      );
    } catch {
      await sendDM(
        `Unexpected error while retrieving account balance!`,
        sender
      );
    }
  } else if (text == "!address") {
    await sendDM(address, sender);
  } else if (text.startsWith("!withdraw")) {
    console.log("executing withdraw..");
    try {
      const args = text.split(" ");
      if (!args[1])
        return await sendDM("Please specify amount to withdraw!", sender);
      if (!args[2])
        return await sendDM("Please specify address to withdraw to!", sender);

      await sendDM("Your withdraw request has been queued.", sender);

      const amt = parseFloat(args[1]);
      const recipient = args[2];

      if (!tools.validateAddress(recipient))
        return await sendDM("Invalid address given!", sender);

      if (amt < 0.01)
        return await sendDM("Minimum amount to withdraw is 0.01 XNO.", sender);

      const walletBalanceRaw = ((await getBalance(address)) as any).balance;
      const balance = parseFloat(
        new BigNumber(tools.convert(walletBalanceRaw, "RAW", "NANO")).toFixed(5)
      );

      if (amt > balance)
        return await sendDM(
          `Not enough balance, requested to withdraw ${amt} Ӿ but maximum spendable is ${balance} Ӿ`,
          sender
        );

      const rep = await getRepresentative(address);
      const ack = await accountInfo(address);

      const frontier = ack.frontier;

      if (frontier) {
        const send_block = block.send(
          {
            fromAddress: address,
            representativeAddress: ack.representative,
            toAddress: recipient,
            amountRaw: tools.convert(amt.toString(), "NANO", "RAW"),
            frontier,
            walletBalanceRaw,
            work: await generateWork(frontier),
          },
          wallet.private
        );
        const res = await processBlock(send_block, "send");
        return await sendDM(
          `Withdraw successful!\n\nHash: ${res.hash}`,
          sender
        );
      }
    } catch (e) {
      console.error(e);
      await sendDM("Failed to withdraw XNO, Is the account open?", sender);
    }
  } else if (text == "!help") {
    await sendDM(
      `̲𝙷̲̲𝚎̲̲𝚕̲̲𝚙̲ ̲𝙲̲̲𝚘̲̲𝚖̲̲𝚖̲̲𝚊̲̲𝚗̲̲𝚍̲̲𝚜̲:
      
      𝘛𝘩𝘦𝘴𝘦 𝘢𝘳𝘦 𝘵𝘩𝘦 𝘢𝘷𝘢𝘪𝘭𝘢𝘣𝘭𝘦 𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴 𝘺𝘰𝘶 𝘤𝘢𝘯 𝘶𝘴𝘦:
      
      • !deposit - 𝘚𝘩𝘰𝘸 𝘺𝘰𝘶𝘳 𝘕𝘈𝘕𝘖 𝘥𝘦𝘱𝘰𝘴𝘪𝘵 𝘢𝘥𝘥𝘳𝘦𝘴𝘴
      • !balance - 𝘊𝘩𝘦𝘤𝘬 𝘺𝘰𝘶𝘳 𝘕𝘈𝘕𝘖 𝘣𝘢𝘭𝘢𝘯𝘤𝘦
      • !address - 𝘎𝘦𝘵 𝘢 𝘤𝘰𝘱𝘺 𝘰𝘧 𝘺𝘰𝘶𝘳 𝘕𝘈𝘕𝘖 𝘥𝘦𝘱𝘰𝘴𝘪𝘵 𝘢𝘥𝘥𝘳𝘦𝘴𝘴
      • !withdraw <amount> <address> - 𝘞𝘪𝘵𝘩𝘥𝘳𝘢𝘸 𝘴𝘱𝘦𝘤𝘪𝘧𝘪𝘦𝘥 𝘢𝘮𝘰𝘶𝘯𝘵 𝘵𝘰 𝘢𝘯 𝘢𝘥𝘥𝘳𝘦𝘴𝘴
      • !help - 𝘋𝘪𝘴𝘱𝘭𝘢𝘺 𝘵𝘩𝘪𝘴 𝘩𝘦𝘭𝘱 𝘮𝘦𝘯𝘶

      Found bugs? 𝘊𝘰𝘯𝘵𝘢𝘤𝘵 @write_int`,
      sender
    );
  }

  markIdAsProcessed(id);
}
