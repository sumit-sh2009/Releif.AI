import json
import requests
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END

from rag_store import retrieve_context
from llm_gateway import call_llm
from memory import extract_and_store_memory, get_memory_context

class GraphState(TypedDict):
    messages: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    casualties: dict
    weather_data: dict
    weather_source: str
    calculated_risk: str
    risk_points: int
    rag_context: str
    rag_relevant: bool
    user_memory: str
    final_response: dict

def extract_memory_node(state: GraphState) -> dict:
    msg = state.get("messages", "")
    if msg:
        extract_and_store_memory(msg)
    return {"user_memory": get_memory_context()}

def fetch_weather_node(state: GraphState) -> dict:
    lat = state.get("latitude")
    lon = state.get("longitude")
    location = state.get("location", "Unknown")

    if lat is not None and lon is not None:
        try:
            res = requests.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m",
                    "timezone": "auto"
                },
                timeout=5
            )
            res.raise_for_status()
            current = res.json().get("current", {})
            return {
                "weather_data": {
                    "rainfall_mm": current.get("precipitation", 0.0),
                    "wind_speed_kmh": current.get("wind_speed_10m", 0.0),
                    "wind_gusts_kmh": current.get("wind_gusts_10m", 0.0),
                    "temperature_c": current.get("temperature_2m", 25.0),
                    "humidity_pct": current.get("relative_humidity_2m", 50.0),
                    "source": "open_meteo"
                },
                "weather_source": "open_meteo"
            }
        except Exception:
            pass

    try:
        import ollama
        res = ollama.chat(
            model="llama3.2",
            messages=[{
                "role": "user",
                "content": f"Estimate current weather for {location}. Return JSON only with keys: rainfall_mm, wind_speed_kmh, wind_gusts_kmh, temperature_c, humidity_pct."
            }],
            format="json"
        )
        raw = json.loads(res["message"]["content"])
        raw["source"] = "llm_fallback"
        return {"weather_data": raw, "weather_source": "llm_fallback"}
    except Exception:
        return {"weather_data": {"source": "unavailable"}, "weather_source": "unavailable"}

def calculate_risk_node(state: GraphState) -> dict:
    w = state.get("weather_data", {})
    c = state.get("casualties", {})
    
    pts = 0
    rain = w.get("rainfall_mm", 0)
    wind = w.get("wind_speed_kmh", 0)
    gusts = w.get("wind_gusts_kmh", 0)
    aff = c.get("affected_people", 0)
    inj = c.get("injured", 0)
    miss = c.get("missing", 0)

    if rain >= 200: pts += 5
    elif rain >= 100: pts += 4
    elif rain >= 50: pts += 3
    elif rain >= 20: pts += 2
    elif rain > 0: pts += 1

    if wind >= 80: pts += 3
    elif wind >= 50: pts += 2
    elif wind >= 30: pts += 1

    if gusts >= 100: pts += 3
    elif gusts >= 80: pts += 2
    elif gusts >= 50: pts += 1

    if aff >= 1000: pts += 3
    elif aff >= 100: pts += 2
    elif aff > 0: pts += 1

    if inj >= 50: pts += 2
    elif inj > 0: pts += 1

    if miss >= 10: pts += 2
    elif miss > 0: pts += 1

    if pts >= 12: risk = "CRITICAL"
    elif pts >= 8: risk = "HIGH"
    elif pts >= 4: risk = "MODERATE"
    else: risk = "LOW"

    return {"calculated_risk": risk, "risk_points": pts}

def route_by_risk(state: GraphState) -> str:
    return "fast_response" if state.get("calculated_risk") == "LOW" else "rag_retrieval"

def fast_response_node(state: GraphState) -> dict:
    w = state.get("weather_data", {})
    resp = {
        "risk_level": "LOW",
        "summary": f"Current conditions at {state.get('location')} indicate low flood risk.",
        "weather_concerns": [f"Rainfall: {w.get('rainfall_mm', 0)}mm", f"Wind: {w.get('wind_speed_kmh', 0)}km/h"],
        "casualty_concerns": ["No significant population impact"],
        "priority_actions": ["Monitor updates", "Keep emergency kit ready"],
        "confidence_score": 0.95,
        "evacuation_recommended": False,
        "data_sources_used": [state.get("weather_source", "unknown"), "deterministic_engine"]
    }
    return {"final_response": resp}

def rag_retrieval_node(state: GraphState) -> dict:
    query = state.get("messages", "")
    risk = state.get("calculated_risk", "")
    try:
        return {"rag_context": retrieve_context(f"{query} risk level {risk}")}
    except Exception:
        return {"rag_context": ""}

def grade_documents_node(state: GraphState) -> dict:
    ctx = state.get("rag_context", "").lower()
    keywords = ["flood", "rain", "water", "evacuation", "shelter", "warning", "river", "dam", "emergency", "rescue"]
    hits = sum(1 for kw in keywords if kw in ctx)
    is_relevant = hits >= 2
    return {
        "rag_relevant": is_relevant,
        "rag_context": ctx if is_relevant else "Context irrelevant."
    }

def llm_synthesis_node(state: GraphState) -> dict:
    risk = state.get("calculated_risk", "UNKNOWN")
    w = state.get("weather_data", {})
    c = state.get("casualties", {})
    src = state.get("weather_source", "unknown")
    rag = state.get("rag_context", "")
    mem = state.get("user_memory", "")

    sources = [src, "deterministic_risk_engine"]
    if state.get("rag_relevant"):
        sources.append("faiss_rag_knowledge_base")
    if mem and mem != "No personal context available.":
        sources.append("user_memory_engine")

    prompt = f"""
Analyze the disaster situation and provide a JSON response.
Location: {state.get('location')}
Weather: {json.dumps(w)}
Casualties: {json.dumps(c)}
Risk Level: {risk}
Context: {rag}
Personal Details to consider: {mem}

Return ONLY valid JSON matching this schema:
{{
    "risk_level": "{risk}",
    "summary": "...",
    "weather_concerns": ["..."],
    "casualty_concerns": ["..."],
    "priority_actions": ["..."],
    "confidence_score": 0.9,
    "evacuation_recommended": true/false,
    "data_sources_used": {json.dumps(sources)}
}}
"""
    result = call_llm(prompt, risk, w)
    return {"final_response": result}

graph = StateGraph(GraphState)
graph.add_node("extract_memory", extract_memory_node)
graph.add_node("fetch_weather", fetch_weather_node)
graph.add_node("calculate_risk", calculate_risk_node)
graph.add_node("fast_response", fast_response_node)
graph.add_node("rag_retrieval", rag_retrieval_node)
graph.add_node("grade_documents", grade_documents_node)
graph.add_node("llm_synthesis", llm_synthesis_node)

graph.add_edge(START, "extract_memory")
graph.add_edge("extract_memory", "fetch_weather")
graph.add_edge("fetch_weather", "calculate_risk")
graph.add_conditional_edges("calculate_risk", route_by_risk, {"fast_response": "fast_response", "rag_retrieval": "rag_retrieval"})
graph.add_edge("fast_response", END)
graph.add_edge("rag_retrieval", "grade_documents")
graph.add_edge("grade_documents", "llm_synthesis")
graph.add_edge("llm_synthesis", END)

app_graph = graph.compile()
