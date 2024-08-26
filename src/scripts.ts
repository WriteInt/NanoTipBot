import { exec } from "child_process";
import { promisify } from "util";

const promise = promisify(exec);

export async function sendDM(message: string, userId: string) {
    const command = `python ./scripts/dm.py ${userId} "${message}"`;
    try {
        await promise(command);
    } catch (error) {
        console.error(`Error sending DM: ${(error as Error).message}`);
    }
}

export async function sendReply(message: string, convoId: string) {
    const command = `python ./scripts/reply.py ${convoId} "${message}"`;
    try {
        await promise(command);
    } catch (error) {
        console.error(`Error sending DM: ${(error as Error).message}`);
    }
}