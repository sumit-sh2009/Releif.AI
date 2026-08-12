import { FirstAidRequest, FirstAidResponse } from '@/types/first-aid';
import { AIProvider } from '@/lib/providers/ai/mock-ai-provider';

export class FirstAidService {
  constructor(private aiProvider: AIProvider) {}

  async getGuidance(request: FirstAidRequest): Promise<FirstAidResponse> {
    // Here we can add validation, sanitization, or analytics logging
    // before delegating to the AI provider.
    
    if (!request.emergencyDescription || request.emergencyDescription.trim().length === 0) {
      throw new Error('Emergency description is required');
    }

    return this.aiProvider.generateFirstAidGuidance(request);
  }
}
