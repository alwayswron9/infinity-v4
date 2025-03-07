import logging
import numpy as np
import openai
from typing import List, Optional
import time

from app.core.config import settings
from app.core.errors import ExternalServiceError

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        """Initialize the embedding service with OpenAI API key"""
        openai.api_key = settings.OPENAI_API_KEY
        
        if not openai.api_key:
            logger.warning("OpenAI API key not set. Embedding generation will fail.")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for the given text using OpenAI API"""
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding generation")
            return []
            
        try:
            # Retry mechanism for API rate limits
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = openai.Embedding.create(
                        input=text,
                        model="text-embedding-ada-002"
                    )
                    return response["data"][0]["embedding"]
                except openai.error.RateLimitError:
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt  # Exponential backoff
                        logger.warning(f"Rate limit hit, retrying in {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        raise
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise ExternalServiceError(f"Failed to generate embedding: {str(e)}")
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embedding vectors"""
        if not embedding1 or not embedding2:
            return 0.0
            
        try:
            # Convert to numpy arrays
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Calculate cosine similarity
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
                
            return dot_product / (norm1 * norm2)
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return 0.0
