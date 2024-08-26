import { Database } from "bun:sqlite";
import { create_wallet } from "../nano";

const db = new Database("users.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      address TEXT,
      private TEXT,
      public TEXT
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS processed_ids (
      id TEXT PRIMARY KEY
    );
`);

export function createUser(
  id: string,
  address: string,
  privateKey: string,
  publicKey: string
) {
  const stmt = db.prepare(`
        INSERT INTO users (id, address, private, public)
        VALUES (?, ?, ?, ?)
    `);
  stmt.run(id, address, privateKey, publicKey);
}

export function getUser(id: string) {
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
  return stmt.get(id) as any;
}

export async function createOrGetWallet(id: string) {
  const existingUser = getUser(id);
  if (existingUser) {
    return {
      address: existingUser.address,
      private: existingUser.private,
      public: existingUser.public,
    };
  } else {
    const account = create_wallet();
    createUser(id, account.address, account.private, account.public);

    return {
      address: account.address,
      private: account.private,
      public: account.public,
    };
  }
}

export function markIdAsProcessed(id: string) {
  const stmt = db.prepare(`INSERT INTO processed_ids (id) VALUES (?)`);
  stmt.run(id);
}

export function isIdProcessed(id: string) {
  const stmt = db.prepare(
    `SELECT COUNT(*) as count FROM processed_ids WHERE id = ?`
  );
  const result = stmt.get(id);
  return (result as any).count > 0;
}

export function accountExists(address: string): boolean {
  const stmt = db.prepare(`SELECT 1 FROM users WHERE address = ?`);
  const result = stmt.get(address);
  return !!result;
}

export function getAccountByAddress(address: string): any {
    const stmt = db.prepare(`SELECT * FROM users WHERE address = ?`);
    return stmt.get(address); 
}