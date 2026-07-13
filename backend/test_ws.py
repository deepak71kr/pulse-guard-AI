import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/vitals/test-patient?scenario=sepsis"
    try:
        async with websockets.connect(uri) as websocket:
            for _ in range(5):
                response = await websocket.recv()
                data = json.loads(response)
                print("Vitals:", data.get("vitals"))
                print("Recommendation:", data.get("recommendation"))
                print("Thoughts:", data.get("thoughts"))
                print("-" * 50)
    except Exception as e:
        print("WebSocket Error:", e)

if __name__ == "__main__":
    asyncio.run(test_websocket())
