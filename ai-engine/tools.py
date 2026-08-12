"""
tools.py — LangChain Tool Definitions for Relief.AI

These tools can be bound to LangChain agents or used independently.
Each tool has full docstrings so the LLM knows when/how to call them.
"""

from typing import Optional
from langchain_core.tools import tool
from schemas import WeatherData, CasualtyData
import requests
import json


@tool
def predict_flood_risk(
    rainfall_mm: float,
    wind_speed_kmh: float,
    wind_gusts_kmh: float = 0.0,
    affected_people: int = 0,
    injured: int = 0,
    missing: int = 0
) -> dict:
    """
    Predict flood risk level using the deterministic neuro-symbolic scoring engine.
    Takes weather measurements and casualty data to compute a risk classification.

    Args:
        rainfall_mm: Current precipitation in millimeters per hour.
        wind_speed_kmh: Wind speed at 10m above ground in km/h.
        wind_gusts_kmh: Wind gust speed in km/h.
        affected_people: Total population in the impacted zone.
        injured: Number of reported injuries.
        missing: Number of missing persons.

    Returns:
        A dict with risk_level (LOW/MODERATE/HIGH/CRITICAL), score points, and details.
    """
    points = 0

    # Rainfall scoring
    if rainfall_mm >= 200: points += 5
    elif rainfall_mm >= 100: points += 4
    elif rainfall_mm >= 50: points += 3
    elif rainfall_mm >= 20: points += 2
    elif rainfall_mm > 0: points += 1

    # Wind scoring
    if wind_speed_kmh >= 80: points += 3
    elif wind_speed_kmh >= 50: points += 2
    elif wind_speed_kmh >= 30: points += 1

    # Wind gusts scoring
    if wind_gusts_kmh >= 100: points += 3
    elif wind_gusts_kmh >= 80: points += 2
    elif wind_gusts_kmh >= 50: points += 1

    # Casualty scoring
    if affected_people >= 1000: points += 3
    elif affected_people >= 100: points += 2
    elif affected_people > 0: points += 1

    if injured >= 50: points += 2
    elif injured > 0: points += 1

    if missing >= 10: points += 2
    elif missing > 0: points += 1

    # Classification
    if points >= 12: risk = "CRITICAL"
    elif points >= 8: risk = "HIGH"
    elif points >= 4: risk = "MODERATE"
    else: risk = "LOW"

    return {
        "risk_level": risk,
        "score_points": points,
        "rainfall_mm": rainfall_mm,
        "wind_speed_kmh": wind_speed_kmh,
        "evacuation_recommended": risk in ("HIGH", "CRITICAL")
    }


@tool
def get_weather_data(latitude: float, longitude: float) -> dict:
    """
    Fetch current weather data for given GPS coordinates from Open-Meteo API.
    Returns temperature, humidity, precipitation, wind speed, and wind gusts.

    Args:
        latitude: Geographic latitude (-90 to 90).
        longitude: Geographic longitude (-180 to 180).

    Returns:
        A dict with current weather measurements validated through WeatherData schema.
    """
    try:
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m",
                "timezone": "auto"
            },
            timeout=8
        )
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})

        weather = WeatherData(
            rainfall_mm=current.get("precipitation", 0.0),
            wind_speed_kmh=current.get("wind_speed_10m", 0.0),
            wind_gusts_kmh=current.get("wind_gusts_10m", 0.0),
            temperature_c=current.get("temperature_2m", 25.0),
            humidity_pct=current.get("relative_humidity_2m", 50.0),
            source="open_meteo"
        )
        return weather.model_dump()

    except Exception as e:
        return WeatherData(source="unavailable").model_dump()


@tool
def search_flood_knowledge(query: str) -> str:
    """
    Search the FAISS flood safety knowledge base for relevant information.
    Use this when the user asks about flood safety procedures, evacuation
    guidelines, historical floods, or emergency protocols.

    Args:
        query: Natural language search query about flood safety.

    Returns:
        Relevant text passages from the knowledge base.
    """
    try:
        from rag_store import retrieve_context
        return retrieve_context(query)
    except Exception as e:
        return f"Knowledge base search failed: {str(e)}"


# ─────────────────────────────────────────────
# Tool Registry (for agent binding)
# ─────────────────────────────────────────────
ALL_TOOLS = [predict_flood_risk, get_weather_data, search_flood_knowledge]


if __name__ == "__main__":
    print("=== Testing predict_flood_risk ===")
    result = predict_flood_risk.invoke({
        "rainfall_mm": 120.5,
        "wind_speed_kmh": 45.0,
        "affected_people": 300,
        "injured": 10,
        "missing": 1
    })
    print(f"Result: {result}")

    print("\n=== Testing get_weather_data ===")
    result = get_weather_data.invoke({
        "latitude": 19.0760,
        "longitude": 72.8777
    })
    print(f"Result: {result}")

    print("\n=== Testing search_flood_knowledge ===")
    result = search_flood_knowledge.invoke({
        "query": "What to do during flash flood?"
    })
    print(f"Result: {result[:200]}...")