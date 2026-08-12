import { NextRequest, NextResponse } from 'next/server';
import { PredictionService } from '@/lib/services/prediction/prediction-service';
import { getPredictionProvider } from '@/lib/providers';
import { EnvironmentalData } from '@/types/prediction';

const predictionService = new PredictionService(getPredictionProvider());

export async function POST(request: NextRequest) {
  try {
    const body: EnvironmentalData = await request.json();
    
    if (!body.location || body.rainfall === undefined || body.waterLevel === undefined) {
      return NextResponse.json({ error: 'Missing required environmental data' }, { status: 400 });
    }

    const prediction = await predictionService.runPrediction(body);
    
    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error running prediction:', error);
    return NextResponse.json({ error: 'Failed to run prediction' }, { status: 500 });
  }
}
