import { FirstAidRequest, FirstAidResponse } from '@/types/first-aid';
import { AIProvider } from './mock-ai-provider';

interface CentreChatResponse {
  risk_level: string;
  summary: string;
  weather_concerns?: string[];
  casualty_concerns?: string[];
  priority_actions?: string[];
}

function mapUrgency(level: string): FirstAidResponse['urgencyLevel'] {
  if (level === 'MODERATE') return 'MEDIUM';
  if (level === 'CRITICAL' || level === 'HIGH' || level === 'LOW') return level;
  return 'HIGH';
}

export class CentreAIProvider implements AIProvider {
  constructor(private baseUrl: string) {}

  async generateFirstAidGuidance(request: FirstAidRequest): Promise<FirstAidResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: [
          'Provide first aid and emergency guidance for the following situation.',
          `Emergency: ${request.emergencyDescription}`,
          request.symptoms ? `Symptoms: ${request.symptoms}` : '',
          request.situationInformation ? `Context: ${request.situationInformation}` : '',
          request.location ? `Location: ${request.location}` : '',
          'Return actionable steps the responder can take immediately.',
        ]
          .filter(Boolean)
          .join('\n'),
        casualties: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Centre error: ${response.status}`);
    }

    const result: CentreChatResponse = await response.json();

    return {
      immediateSteps:
        result.priority_actions?.length
          ? result.priority_actions
          : [
              'Ensure the area is safe for you and the victim.',
              'Keep the person calm and monitor breathing.',
              'Contact local emergency services immediately.',
            ],
      thingsToAvoid: [
        ...(result.weather_concerns ?? []).slice(0, 2),
        ...(result.casualty_concerns ?? []).slice(0, 2),
        'Do not move the person unless they are in immediate danger.',
      ].slice(0, 4),
      urgencyLevel: mapUrgency(result.risk_level),
      whenToSeekProfessionalHelp:
        result.summary ||
        'Seek professional medical help if the situation worsens or symptoms persist.',
      safetyDisclaimer:
        'This is AI-generated guidance from the ReliefAI disaster network. It is not a substitute for professional medical care or official emergency directives.',
    };
  }
}
