"""
Llama Guard 3 Integration for Content Safety Checking
This module provides safety checking for user queries using Meta's Llama Guard 3 model.
"""

import os
import logging
from typing import Dict, Tuple
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client
client = None

def initialize_llama_guard(api_key: str = None):
    """
    Initialize the Groq client for Llama Guard.

    Args:
        api_key: Groq API key. If not provided, reads from GROQ_API_KEY env variable.
    """
    global client
    if api_key is None:
        api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is required. Set it in .env file or pass as parameter.")

    client = Groq(api_key=api_key)
    logger.info("Llama Guard initialized successfully")


async def llama_guard_check(prompt: str, model: str = "llama-guard-3-8b") -> Tuple[bool, str, Dict]:
    """
    Check if the prompt is safe using Llama Guard 3.

    Llama Guard 3 detects:
    - Violent Crimes
    - Non-Violent Crimes
    - Sex-Related Crimes
    - Child Sexual Exploitation
    - Defamation
    - Specialized Advice (financial, medical, legal)
    - Privacy violations
    - Intellectual Property violations
    - Indiscriminate Weapons
    - Hate speech
    - Suicide & Self-Harm
    - Sexual Content

    Args:
        prompt: The user's input prompt to check
        model: Llama Guard model to use (default: llama-guard-3-8b)

    Returns:
        Tuple of (is_safe: bool, category: str, details: dict)
        - is_safe: True if prompt is safe, False if unsafe
        - category: "safe" or the specific unsafe category
        - details: Additional information about the check
    """
    global client

    if client is None:
        initialize_llama_guard()

    try:
        # Call Llama Guard 3 via Groq API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,  # Use deterministic output for safety checks
            max_tokens=100
        )

        result = response.choices[0].message.content.strip()

        # Parse Llama Guard response
        # Response format: "safe" or "unsafe\n<category>"
        is_safe = result.lower().startswith("safe")

        if is_safe:
            category = "safe"
            logger.info(f"Prompt passed Llama Guard check: {prompt[:50]}...")
        else:
            # Extract the unsafe category
            lines = result.split('\n')
            category = lines[1] if len(lines) > 1 else "unknown"
            logger.warning(f"Prompt blocked by Llama Guard - Category: {category}")

        details = {
            "model": model,
            "full_response": result,
            "prompt_preview": prompt[:100] + "..." if len(prompt) > 100 else prompt
        }

        return is_safe, category, details

    except Exception as e:
        logger.error(f"Error in Llama Guard check: {str(e)}")
        # In case of error, fail closed (block the request)
        return False, "error", {"error": str(e)}


def get_safety_categories() -> Dict[str, str]:
    """
    Get the list of safety categories that Llama Guard 3 checks for.

    Returns:
        Dictionary mapping category codes to descriptions
    """
    return {
        "S1": "Violent Crimes",
        "S2": "Non-Violent Crimes",
        "S3": "Sex-Related Crimes",
        "S4": "Child Sexual Exploitation",
        "S5": "Defamation",
        "S6": "Specialized Advice",
        "S7": "Privacy",
        "S8": "Intellectual Property",
        "S9": "Indiscriminate Weapons",
        "S10": "Hate",
        "S11": "Suicide & Self-Harm",
        "S12": "Sexual Content",
        "S13": "Elections",
        "S14": "Code Interpreter Abuse"
    }


async def batch_check(prompts: list) -> list:
    """
    Check multiple prompts in batch.

    Args:
        prompts: List of prompts to check

    Returns:
        List of tuples (is_safe, category, details) for each prompt
    """
    results = []
    for prompt in prompts:
        result = await llama_guard_check(prompt)
        results.append(result)
    return results
