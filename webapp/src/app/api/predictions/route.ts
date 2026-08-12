import { NextResponse } from 'next/server';
import { PredictionService } from '@/lib/services/prediction/prediction-service';
import { getPredictionProvider } from '@/lib/providers';

const predictionService = new PredictionService(getPredictionProvider());

export async function GET() {
  try {
    const predictions = await predictionService.getAllPredictions();
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}
