import { EnvironmentalData, PredictionResult } from '@/types/prediction';
import { PredictionProvider } from '@/lib/providers/prediction/mock-prediction-provider';
import { Database } from '@/lib/database';

export class PredictionService {
  constructor(private provider: PredictionProvider) {}

  async runPrediction(data: EnvironmentalData): Promise<PredictionResult> {
    // 1. Get prediction from provider
    const result = await this.provider.runPrediction(data);
    
    // 2. Save result to database
    const savedResult = await Database.predictions.create(result);
    
    return savedResult;
  }

  async getPredictionById(id: string): Promise<PredictionResult | null> {
    return Database.predictions.getById(id);
  }

  async getAllPredictions(): Promise<PredictionResult[]> {
    return Database.predictions.getAll();
  }
}
