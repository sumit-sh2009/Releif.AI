export interface EnvironmentalData {
  location: string;
  rainfall: number;
  temperature: number;
  humidity: number;
  wind: number;
  waterLevel: number;
  historicalData?: Record<string, unknown>;
  otherSignals?: Record<string, unknown>;
}

export interface PredictionResult {
  id: string;
  disasterType: string;
  location: string;
  probability: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedTime: string;
  affectedArea: string;
  estimatedPeopleAffected: number;
  confidence: number;
  createdAt: string;
  modelVersion: string;
}
