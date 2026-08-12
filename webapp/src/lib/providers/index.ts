import { MockAIProvider } from './ai/mock-ai-provider';
import { CentreAIProvider } from './ai/centre-ai-provider';
import { EnginePredictionProvider } from './prediction/engine-prediction-provider';
import { MockPredictionProvider } from './prediction/mock-prediction-provider';
import type { PredictionProvider } from './prediction/mock-prediction-provider';
import type { AIProvider } from './ai/mock-ai-provider';

export function getPredictionProvider(): PredictionProvider {
  const engineUrl = process.env.AI_ENGINE_URL;
  if (engineUrl) {
    const engine = new EnginePredictionProvider(engineUrl.replace(/\/$/, ''));
    const mock = new MockPredictionProvider();
    return {
      async runPrediction(data) {
        try {
          return await engine.runPrediction(data);
        } catch (err) {
          console.warn('[providers] AI Engine unavailable, using mock:', err);
          return mock.runPrediction(data);
        }
      },
    };
  }
  return new MockPredictionProvider();
}

export function getAIProvider(): AIProvider {
  const centreUrl = process.env.AI_CENTRE_URL;
  if (centreUrl) {
    const centre = new CentreAIProvider(centreUrl.replace(/\/$/, ''));
    const mock = new MockAIProvider();
    return {
      async generateFirstAidGuidance(request) {
        try {
          return await centre.generateFirstAidGuidance(request);
        } catch (err) {
          console.warn('[providers] AI Centre unavailable, using mock:', err);
          return mock.generateFirstAidGuidance(request);
        }
      },
    };
  }
  return new MockAIProvider();
}
