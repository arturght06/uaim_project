import aiohttp
import asyncio
import time


async def fetch(session, url, i):
    async with session.get(url) as response:
        print(f"Req: {i}, Status: {response.status}")
        return await response.text()


async def main():
    url = 'http://0.0.0.0:9002/locations/e1e76683-c631-4a9e-879d-14a95de08380'
    tasks = []

    async with aiohttp.ClientSession() as session:
        for i in range(100):
            # time.sleep(0.1)
            task = asyncio.create_task(fetch(session, url, i))
            tasks.append(task)

        # Wait for all tasks to complete
        await asyncio.gather(*tasks)

if __name__ == '__main__':
    start = time.time()
    asyncio.run(main())
    print(f"Total time: {time.time() - start}")