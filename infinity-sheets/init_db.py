import asyncio
import logging

from app.db.session import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

async def init():
    logger.info("Initializing database")
    await init_db()
    logger.info("Database initialized successfully")

if __name__ == "__main__":
    asyncio.run(init()) 