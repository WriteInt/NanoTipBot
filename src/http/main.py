import asyncio
from aiohttp import web
from twikit import Client

client = Client('en-US')
client.http.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
})
client.load_cookies("cookies.json")

async def handle_reply(request):
    convo_id = request.query.get('convo_id')
    message = request.query.get('message')

    if not convo_id or not message:
        return web.Response(status=400, text='Bad Request: Missing convo_id or message.')

    try:
        await client.create_tweet(text=message, reply_to=convo_id)
        return web.Response(status=200, text='Tweet sent successfully.')
    except Exception as e:
        return web.Response(status=500, text=f'Internal Server Error: {str(e)}')

async def handle_dm(request):
    user_id = request.query.get('user_id')
    message = request.query.get('message')

    if not user_id or not message:
        return web.Response(status=400, text='Bad Request: Missing user_id or message.')

    try:
        await client.send_dm(user_id=user_id, text=message)
        return web.Response(status=200, text='DM sent successfully.')
    except Exception as e:
        return web.Response(status=500, text=f'Internal Server Error: {str(e)}')

def create_app():
    app = web.Application()
    app.router.add_get('/reply', handle_reply)
    app.router.add_get('/dm', handle_dm)
    return app

if __name__ == "__main__":
    app = create_app()
    web.run_app(app, port=8080)
