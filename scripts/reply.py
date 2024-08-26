import argparse
import asyncio
import json
from twikit import Client

async def main(convo_id, text):
    client = Client('en-US')
    
    with open('/home/ubuntu/tipbot/cookies.json', 'r', encoding='utf-8') as f:
        client.set_cookies(json.load(f))
        
    await client.create_tweet(text, reply_to=convo_id)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send a reply.")
    parser.add_argument("convo_id", help="The user ID to send the DM to.")
    parser.add_argument("text", help="The text to include in the DM.")
    
    args = parser.parse_args()
    asyncio.run(main(user_id=args.user_id, text=args.text))
