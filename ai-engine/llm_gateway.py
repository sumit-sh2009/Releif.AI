"""
llm_gateway.py
LLM Failover Gateway
"""

import json
import os
import time
from typing import Optional

import ollama
from groq import Groq
from dotenv import load_dotenv

from schemas import FloodAnalysisResponse

# Load environment variables from .env file
load_dotenv()


OLLAMA_MODEL = "llama3.2"
GROQ_MODEL = "openai/gpt-oss-120b"
OLLAMA_TIMEOUT = 15  # seconds — if Ollama takes longer, failover
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")



def _build_safe_fallback(calculated_risk: str, weather_data: dict) -> dict:
    """
    Deterministic fallback response when ALL LLM providers fail.
    Uses the pre-calculated risk level from the deterministic engine.
    """
    rainfall = weather_data.get("rainfall_mm", 0)
    wind = weather_data.get("wind_speed_kmh", 0)

    return {
        "risk_level": calculated_risk or "UNKNOWN",
        "summary": (
            f"Automated analysis: Current conditions show "
            f"{rainfall}mm precipitation and {wind}km/h winds. "
            f"Risk level assessed as {calculated_risk}. "
            f"LLM synthesis was unavailable — this is a deterministic fallback."
        ),
        "weather_concerns": [
            f"Precipitation: {rainfall}mm" if rainfall > 0 else "No significant precipitation detected",
            f"Wind speed: {wind}km/h" if wind > 20 else "Wind conditions normal"
        ],
        "casualty_concerns": ["Unable to analyze casualty data — LLM unavailable"],
        "priority_actions": [
            "Monitor official weather alerts from local authorities",
            "Prepare emergency kit if risk is MODERATE or higher",
            "Avoid low-lying areas near rivers and drainage channels"
        ],
        "confidence_score": 0.3,
        "evacuation_recommended": calculated_risk in ("HIGH", "CRITICAL"),
        "data_sources_used": ["deterministic_fallback"]
    }



def _call_ollama(prompt: str) -> Optional[str]:
    """Call local Ollama with timeout protection."""
    try:
        start = time.time()
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are a senior disaster management AI analyst for Relief.AI. Your primary task is to process hydrometeorological data and output highly structured, accurate assessments. You must STRICTLY adhere to the requested JSON schema. Never include markdown formatting, explanations, or conversational text. Return ONLY valid, parseable JSON."},
                {"role": "user", "content": prompt}
            ],
            format="json"
        )
        elapsed = time.time() - start
        print(f"[LLM Gateway] Ollama responded in {elapsed:.2f}s")
        return response["message"]["content"]
    except Exception as e:
        print(f"[LLM Gateway] Ollama failed: {e}")
        return None



def _call_groq(prompt: str) -> Optional[str]:
    """Call Groq API as cloud fallback."""
    if not GROQ_API_KEY:
        print("[LLM Gateway] Groq API key not set, skipping Groq fallback.")
        return None
    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a senior disaster management AI analyst for Relief.AI. Your primary task is to process hydrometeorological data and output highly structured, accurate assessments. You must STRICTLY adhere to the requested JSON schema. Never include markdown formatting, explanations, or conversational text. Return ONLY valid, parseable JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1024
        )
        print("[LLM Gateway] Groq responded successfully.")
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLM Gateway] Groq failed: {e}")
        return None



def call_llm(
    prompt: str,
    calculated_risk: str = "UNKNOWN",
    weather_data: dict = None
) -> dict:
    """
    Call the LLM with cascading failover:
      1. Groq (cloud - fast)
      2. Ollama (local)
      3. Deterministic safe fallback

    Returns a validated dict matching FloodAnalysisResponse schema.
    NEVER raises an exception — always returns a valid response.
    """
    weather_data = weather_data or {}

    # Attempt 1: Groq
    raw_response = _call_groq(prompt)

    # Attempt 2: Ollama
    if raw_response is None:
        print("[LLM Gateway] Falling back to Ollama...")
        raw_response = _call_ollama(prompt)

    # Attempt 3: Deterministic fallback
    if raw_response is None:
        print("[LLM Gateway] All LLM providers failed. Using deterministic fallback.")
        return _build_safe_fallback(calculated_risk, weather_data)

    # Parse and validate
    try:
        parsed = json.loads(raw_response)

        # Force the risk_level to match the deterministic engine
        parsed["risk_level"] = calculated_risk

        # Validate through Pydantic
        validated = FloodAnalysisResponse(**parsed)
        return validated.model_dump()

    except (json.JSONDecodeError, Exception) as e:
        print(f"[LLM Gateway] JSON parse/validation failed: {e}")
        print(f"[LLM Gateway] Raw response was: {raw_response[:200]}")
        return _build_safe_fallback(calculated_risk, weather_data)
