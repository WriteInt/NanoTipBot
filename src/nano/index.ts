import { wallet } from "nanocurrency-web";

export function create_wallet() {
    const account = wallet.generate().accounts[0];
    return {
        address: account.address,
        private: account.privateKey,
        public: account.publicKey
    }
}