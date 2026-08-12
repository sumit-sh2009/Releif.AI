import { EnvironmentalData, PredictionResult } from '@/types/prediction';

export interface PredictionProvider {
  runPrediction(data: EnvironmentalData): Promise<PredictionResult>;
}

export class MockPredictionProvider implements PredictionProvider {
  async runPrediction(data: EnvironmentalData): Promise<PredictionResult> {
    // Simulate model inference time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple deterministic mock logic for demonstration
    let riskScore = 0;
    let disasterType = 'NONE';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let probability = 0;

    if (data.rainfall > 100 || data.waterLevel > 5) {
      disasterType = 'FLOOD';
      riskScore += data.rainfall * 0.5 + data.waterLevel * 10;
    } else if (data.temperature > 40 && data.humidity < 20 && data.wind > 20) {
      disasterType = 'WILDFIRE';
      riskScore += data.temperature + data.wind - data.humidity;
    } else if (data.wind > 100) {
      disasterType = 'HURRICANE';
      riskScore += data.wind;
    }

    if (disasterType !== 'NONE') {
      if (riskScore > 150) { severity = 'CRITICAL'; probability = 95; }
      else if (riskScore > 100) { severity = 'HIGH'; probability = 75; }
      else if (riskScore > 50) { severity = 'MEDIUM'; probability = 45; }
      else { severity = 'LOW'; probability = 20; }
    } else {
      probability = 5;
    }

    return {
      id: `pred_${Math.random().toString(36).substr(2, 9)}`,
      disasterType,
      location: data.location,
      probability,
      severity,
      predictedTime: new Date(Date.now() + 86400000).toISOString(), // +24 hours
      affectedArea: `${Math.floor(Math.random() * 100)} sq km`,
      estimatedPeopleAffected: Math.floor(Math.random() * 5000),
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      createdAt: new Date().toISOString(),
      modelVersion: 'mock-v1.0.0'
    };
  }
}
