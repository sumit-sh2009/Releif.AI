import { EnvironmentalData, PredictionResult } from '@/types/prediction';
import { PredictionProvider } from './mock-prediction-provider';

interface EngineAnalysisResponse {
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  weather_concerns?: string[];
  casualty_concerns?: string[];
  priority_actions?: string[];
  confidence_score?: number;
  evacuation_recommended?: boolean;
  data_sources_used?: string[];
}

function mapSeverity(level: string): PredictionResult['severity'] {
  if (level === 'MODERATE') return 'MEDIUM';
  if (level === 'CRITICAL' || level === 'HIGH' || level === 'LOW') return level;
  return 'LOW';
}

function riskToProbability(level: string, confidence: number): number {
  const base: Record<string, number> = {
    CRITICAL: 95,
    HIGH: 78,
    MODERATE: 52,
    LOW: 18,
  };
  return Math.round((base[level] ?? 30) * (confidence || 0.85));
}

export class EnginePredictionProvider implements PredictionProvider {
  constructor(private baseUrl: string) {}

  async runPrediction(data: EnvironmentalData): Promise<PredictionResult> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Analyze flood and disaster risk for ${data.location}. Environmental readings: rainfall ${data.rainfall}mm, water level ${data.waterLevel}m, temperature ${data.temperature}°C, humidity ${data.humidity}%, wind ${data.wind} km/h.`,
        location: data.location,
        casualties: {
          affected_people: Math.max(0, Math.floor(data.rainfall * 5 + data.waterLevel * 50)),
          injured: 0,
          missing: 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Engine error: ${response.status}`);
    }

    const result: EngineAnalysisResponse = await response.json();
    const confidence = result.confidence_score ?? 0.85;

    return {
      id: `pred_${Math.random().toString(36).slice(2, 11)}`,
      disasterType: 'FLOOD',
      location: data.location,
      probability: riskToProbability(result.risk_level, confidence),
      severity: mapSeverity(result.risk_level),
      predictedTime: new Date(Date.now() + 86400000).toISOString(),
      affectedArea: result.summary.slice(0, 80),
      estimatedPeopleAffected: Math.max(
        100,
        Math.floor(data.rainfall * 10 + data.waterLevel * 200),
      ),
      confidence: Math.round(confidence * 100),
      createdAt: new Date().toISOString(),
      modelVersion: 'ai-engine-langgraph-v1',
    };
  }
}
