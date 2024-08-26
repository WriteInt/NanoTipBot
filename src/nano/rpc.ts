import axios from "axios";

const headers = {
  "nodes-api-key":
    "yournanswapapi",
};
const rpc = "https://nodes.nanswap.com/XNO";

export async function getBalance(account: string) {
  return (
    await axios.post(rpc, { action: "account_balance", account }, { headers })
  ).data;
}

export async function getRepresentative(account: string) {
  return (
    await axios.post(
      rpc,
      { action: "account_representative", account },
      { headers }
    )
  ).data;
}

export async function getFrontier(account: string) {
  const arr = (
    await axios.post(
      rpc,
      { action: "account_frontiers", accounts: [account] },
      { headers }
    )
  ).data;
  return arr.frontiers[account];
}

export async function generateWork(hash: string) {
  return (await axios.post(rpc, { action: "work_generate", hash }, { headers }))
    .data.work;
}

export async function processBlock(block: any, subtype: "send" | "receive") {
  return (
    await axios.post(
      rpc,
      { action: "process", json_block: true, subtype, block },
      { headers }
    )
  ).data;
}

export async function accountInfo(account: string) {
  return (
    await axios.post(
      rpc,
      {
        action: "account_info",
        account,
        representative: "true",
      },
      { headers }
    )
  ).data;
}
