from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from urllib.request import urlopen
from urllib.parse import urlencode
import os
from groq import Groq
import json

app = FastAPI(title="AI Disaster Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    latitude: float | None = None
    longitude: float | None = None
    weather: dict = {}
    casualties: dict = {}


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Harsh AI Disaster Management API is running!"
    }

def calculate_risk(weather, casualties):
    score = 0

    # Weather risk
    flood_risk = str(weather.get("flood_risk", "")).lower()

    if flood_risk == "critical":
        score += 4
    elif flood_risk == "high":
        score += 3
    elif flood_risk == "moderate":
        score += 2
    elif flood_risk == "low":
        score += 1

    rainfall = float(weather.get("rainfall_mm", 0) or 0)
    wind = float(weather.get("wind_speed_kmh", 0) or 0)

    if rainfall >= 200:
        score += 4
    elif rainfall >= 100:
        score += 3
    elif rainfall >= 50:
        score += 2

    if wind >= 100:
        score += 4
    elif wind >= 60:
        score += 3
    elif wind >= 40:
        score += 2

    # Casualty / affected population risk
    affected = int(casualties.get("affected_people", 0) or 0)
    injured = int(casualties.get("injured", 0) or 0)
    missing = int(casualties.get("missing", 0) or 0)

    if affected >= 1000:
        score += 4
    elif affected >= 500:
        score += 3
    elif affected >= 100:
        score += 2

    if injured >= 50:
        score += 4
    elif injured >= 20:
        score += 3
    elif injured > 0:
        score += 2

    if missing >= 20:
        score += 4
    elif missing >= 5:
        score += 3
    elif missing > 0:
        score += 2

    # Final risk level
    if score >= 15:
        return "CRITICAL"
    elif score >= 10:
        return "HIGH"
    elif score >= 5:
        return "MODERATE"
    else:
        return "LOW"
@app.get("/weather")
def get_weather(latitude: float, longitude: float):

    params = urlencode({
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m",
        "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m",
        "forecast_days": 3,
        "timezone": "auto"
    })

    url = "https://api.open-meteo.com/v1/forecast?" + params

    try:
        with urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())

        return {
            "status": "success",
            "latitude": latitude,
            "longitude": longitude,
            "timezone": data.get("timezone"),
            "current": data.get("current"),
            "hourly": data.get("hourly")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Weather service error: {str(e)}"
        )
@app.post("/chat")
def chat(request: ChatRequest):
    weather_data = request.weather

    if request.latitude is not None and request.longitude is not None:

        params = urlencode({
            "latitude": request.latitude,
            "longitude": request.longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m",
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m",
            "forecast_days": 3,
            "timezone": "auto"
        })

        weather_url = "https://api.open-meteo.com/v1/forecast?" + params

        try:
            with urlopen(weather_url, timeout=10) as response:
                weather_data = json.loads(response.read().decode())

        except Exception as e:
            weather_data = {
                "error": f"Unable to retrieve weather data: {str(e)}"
            }

    request.weather = weather_data

    current_weather = weather_data.get("current", {})

    risk_weather = {
        "rainfall_mm": current_weather.get("precipitation", 0),
        "wind_speed_kmh": current_weather.get("wind_speed_10m", 0),
        "flood_risk": "unknown"
    }

    calculated_risk = calculate_risk(
        risk_weather,
        request.casualties
    )
    prompt = f"""
You are Harsh AI, an AI assistant for a weather and disaster
management system.

Analyze ONLY the information provided.

Do NOT invent weather measurements, casualty numbers, locations,
or other facts.

IMPORTANT:
- You are an analysis and decision-support tool.
- Do not claim to be an official emergency authority.
- Do not make autonomous life-critical decisions.
- For emergencies, advise users to follow local emergency authorities.
- Weather prediction data should be treated as provided input, not
  something you independently predict.

WEATHER DATA:
{json.dumps(weather_data)}

CASUALTY DATA:
{json.dumps(request.casualties)}

USER QUESTION:
{request.message}
The Python risk engine has calculated this risk level:

{calculated_risk}

You MUST use this exact risk level.
Do not change it.
Return ONLY valid JSON using exactly this structure:

{{
    "risk_level": "LOW",
    "summary": "detailed and descriptive summary",
    "weather_concerns": [
        "concern 1"
    ],
    "casualty_concerns": [
        "concern 1"
    ],
    "priority_actions": [
        "action 1",
        "action 2"
    ]
}}

The risk_level must be exactly one of:
LOW, MODERATE, HIGH, CRITICAL

Make the summary detailed, descriptive, and helpful.
Do not put Markdown or code fences around the JSON.
"""

    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        answer = response.choices[0].message.content or "{}"
    except Exception as e:
        print("Groq API error:", e)
        answer = "{}"

    try:
        result = json.loads(answer)
    except json.JSONDecodeError:
        result = {
            "risk_level": "UNKNOWN",
            "summary": answer,
            "weather_concerns": [],
            "casualty_concerns": [],
            "priority_actions": []
        }

    return result