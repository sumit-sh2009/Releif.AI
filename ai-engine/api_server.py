"""
api_server.py
FastAPI Server for Relief.AI
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import json
import time

from schemas import FloodAnalysisRequest, FloodAnalysisResponse
from work_flow import app_graph



app = FastAPI(
    title="Relief.AI — Flood Prediction & Analysis API",
    description="Agentic AI flood risk analysis powered by LangGraph, FAISS RAG, and LLM Gateway.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



WEBAPP_URL = "http://localhost:3000"

# Browser paths that belong to the Next.js webapp, not this API
WEBAPP_PATHS = {
    "/map", "/dashboard", "/emergency-requests", "/get-help",
    "/prediction", "/volunteers", "/admin", "/tracking",
    "/ai-first-aid", "/sign-in", "/sign-up",
}


@app.middleware("http")
async def redirect_webapp_paths(request: Request, call_next):
    path = request.url.path.rstrip("/") or "/"
    if request.method == "GET" and path in WEBAPP_PATHS:
        return RedirectResponse(url=f"{WEBAPP_URL}{path}", status_code=302)
    return await call_next(request)


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Relief.AI Flood Prediction Engine",
        "version": "1.0.0",
        "components": {
            "langgraph_workflow": "active",
            "faiss_rag": "active",
            "llm_gateway": "active",
            "risk_engine": "active"
        }
    }


@app.post("/analyze", response_model=FloodAnalysisResponse)
def analyze_flood_risk(request: FloodAnalysisRequest):
    start_time = time.time()

    # Build initial graph state from the validated request
    initial_state = {
        "messages": request.message,
        "location": request.location,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "casualties": request.casualties.model_dump(),
        "weather_data": {},
        "weather_source": "",
        "calculated_risk": "",
        "risk_points": 0,
        "rag_context": "",
        "rag_relevant": False,
        "final_response": {}
    }

    try:
        # Execute the LangGraph workflow
        result = app_graph.invoke(initial_state)
        elapsed = time.time() - start_time

        final = result.get("final_response", {})

        # Add metadata
        final["_metadata"] = {
            "pipeline_time_ms": round(elapsed * 1000),
            "weather_source": result.get("weather_source", "unknown"),
            "risk_points": result.get("risk_points", 0),
            "rag_used": result.get("rag_relevant", False)
        }

        print(f"[API] Analyze completed in {elapsed:.2f}s → {final.get('risk_level')}")

        # Validate through Pydantic before returning
        validated = FloodAnalysisResponse(**final)
        return validated

    except Exception as e:
        print(f"[API] Pipeline error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Flood analysis pipeline error: {str(e)}"
        )



@app.post("/chat")
def chat(request: FloodAnalysisRequest):
    return analyze_flood_risk(request)



@app.get("/weather")
def get_weather(latitude: float, longitude: float):
    """Fetch weather data for given coordinates via Open-Meteo."""
    import requests as req
    try:
        response = req.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m",
                "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m",
                "forecast_days": 3,
                "timezone": "auto"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return {
            "status": "success",
            "latitude": latitude,
            "longitude": longitude,
            "timezone": data.get("timezone"),
            "current": data.get("current"),
            "hourly": data.get("hourly")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
