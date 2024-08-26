import argparse
import asyncio
import json
from twikit import Client

async def main(user_id, text):
    client = Client('en-US')
    
    with open('/home/ubuntu/tipbot/cookies.json', 'r', encoding='utf-8') as f:
        client.set_cookies(json.load(f))

    await client.send_dm(user_id=user_id, text=text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send a DM.")
    parser.add_argument("user_id", help="The user ID to send the DM to.")
    parser.add_argument("text", help="The text to include in the DM.")
    
    args = parser.parse_args()
    asyncio.run(main(user_id=args.user_id, text=args.text))
