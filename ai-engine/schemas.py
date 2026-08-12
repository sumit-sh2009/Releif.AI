"""
schemas.py — Pydantic Data Contracts for Relief.AI Flood Prediction System

All input/output contracts are strictly typed and validated.
The LLM structured output, API requests, and inter-node state
all flow through these schemas to guarantee data integrity.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional


# ─────────────────────────────────────────────
# Weather Data Schema
# ─────────────────────────────────────────────
class WeatherData(BaseModel):
    """Validated weather telemetry from Open-Meteo or LLM fallback."""
    rainfall_mm: float = Field(
        default=0.0, ge=0,
        description="Current precipitation in millimeters per hour."
    )
    wind_speed_kmh: float = Field(
        default=0.0, ge=0,
        description="Wind speed at 10m above ground in km/h."
    )
    wind_gusts_kmh: float = Field(
        default=0.0, ge=0,
        description="Wind gust speed in km/h."
    )
    temperature_c: float = Field(
        default=25.0,
        description="Temperature in degrees Celsius."
    )
    humidity_pct: float = Field(
        default=50.0, ge=0, le=100,
        description="Relative humidity percentage (0-100)."
    )
    source: Literal["open_meteo", "llm_fallback", "manual", "unavailable"] = Field(
        default="unavailable",
        description="Source of the weather data for audit trail."
    )


# ─────────────────────────────────────────────
# Casualty / Impact Data Schema
# ─────────────────────────────────────────────
class CasualtyData(BaseModel):
    """Population impact metrics for risk scoring."""
    affected_people: int = Field(
        default=0, ge=0,
        description="Total population in the impacted zone."
    )
    injured: int = Field(
        default=0, ge=0,
        description="Number of reported injuries."
    )
    missing: int = Field(
        default=0, ge=0,
        description="Number of missing persons."
    )


# ─────────────────────────────────────────────
# Flood Analysis Request (from Express.js)
# ─────────────────────────────────────────────
class FloodAnalysisRequest(BaseModel):
    """Incoming request from the Express.js backend."""
    message: str = Field(
        description="The user's natural language query about flood risk."
    )
    location: str = Field(
        default="Unknown",
        description="Name of the city or region to analyze."
    )
    latitude: Optional[float] = Field(
        None, ge=-90, le=90,
        description="Geographic latitude of the location."
    )
    longitude: Optional[float] = Field(
        None, ge=-180, le=180,
        description="Geographic longitude of the location."
    )
    casualties: CasualtyData = Field(
        default_factory=CasualtyData,
        description="Optional casualty and impact data."
    )


# ─────────────────────────────────────────────
# LLM Structured Output Schema (what the LLM must return)
# ─────────────────────────────────────────────
class FloodAnalysisResponse(BaseModel):
    """Strictly validated LLM output. Every field is enforced."""
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"] = Field(
        description="Flood risk classification. Must match the deterministic engine output exactly."
    )
    summary: str = Field(
        min_length=10, max_length=1000,
        description="Concise 2-3 sentence executive summary of the flood situation."
    )
    weather_concerns: list[str] = Field(
        default_factory=list,
        description="List of key weather-related concerns (e.g., 'Heavy rainfall 120mm/hr')."
    )
    casualty_concerns: list[str] = Field(
        default_factory=list,
        description="List of population impact concerns (e.g., '500 people affected in Zone 3')."
    )
    priority_actions: list[str] = Field(
        default_factory=list,
        description="List of 3-5 immediate, actionable safety steps."
    )
    confidence_score: float = Field(
        default=0.8, ge=0, le=1,
        description="AI confidence in the analysis between 0.0 and 1.0."
    )
    evacuation_recommended: bool = Field(
        default=False,
        description="Whether immediate evacuation is advised."
    )
    data_sources_used: list[str] = Field(
        default_factory=list,
        description="Audit trail of data sources consulted (e.g., 'Open-Meteo API', 'FAISS RAG')."
    )


# ─────────────────────────────────────────────
# RAG Document Relevance Grading (for Corrective RAG)
# ─────────────────────────────────────────────
class DocumentGrade(BaseModel):
    """Used by the CRAG grader to evaluate retrieved document relevance."""
    is_relevant: bool = Field(
        description="Whether the retrieved document is relevant to the current flood query."
    )
    reasoning: str = Field(
        default="",
        description="Brief explanation of why the document is or is not relevant."
    )
