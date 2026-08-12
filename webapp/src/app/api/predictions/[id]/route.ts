import { NextRequest, NextResponse } from 'next/server';
import { PredictionService } from '@/lib/services/prediction/prediction-service';
import { MockPredictionProvider } from '@/lib/providers/prediction/mock-prediction-provider';

const provider = new MockPredictionProvider();
const predictionService = new PredictionService(provider);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prediction = await predictionService.getPredictionById(id);
    
    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: 500 });
  }
}
