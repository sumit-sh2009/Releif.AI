import { FirstAidRequest, FirstAidResponse } from '@/types/first-aid';

export interface AIProvider {
  generateFirstAidGuidance(request: FirstAidRequest): Promise<FirstAidResponse>;
}

export class MockAIProvider implements AIProvider {
  async generateFirstAidGuidance(request: FirstAidRequest): Promise<FirstAidResponse> {
    // Simulate API call to LLM
    await new Promise(resolve => setTimeout(resolve, 1000));

    const desc = request.emergencyDescription.toLowerCase();
    
    // Very basic mock heuristic
    if (desc.includes('burn')) {
      return {
        immediateSteps: [
          'Cool the burn with cool or lukewarm running water for 20 minutes.',
          'Remove any clothing or jewellery that\'s near the burnt area of skin.',
          'Cover the burn with a layer of cling film.'
        ],
        thingsToAvoid: [
          'Do not use ice, iced water, or any creams or greasy substances like butter.'
        ],
        urgencyLevel: 'MEDIUM',
        whenToSeekProfessionalHelp: 'If the burn is larger than the victim\'s hand, or causes a white or charred area.',
        safetyDisclaimer: 'This is AI-generated advice and not a substitute for professional medical help.'
      };
    }

    if (desc.includes('bleed') || desc.includes('cut')) {
      return {
        immediateSteps: [
          'Apply and maintain firm pressure directly over the wound.',
          'Elevate the injured area above the heart if possible.',
          'Keep the person warm and calm.'
        ],
        thingsToAvoid: [
          'Do not remove objects embedded in the wound.',
          'Do not remove a dressing once it is soaked, just add more on top.'
        ],
        urgencyLevel: 'HIGH',
        whenToSeekProfessionalHelp: 'If bleeding does not stop after 10 minutes of continuous pressure.',
        safetyDisclaimer: 'This is AI-generated advice and not a substitute for professional medical help.'
      };
    }

    return {
      immediateSteps: [
        'Ensure the area is safe for both you and the victim.',
        'Keep the person calm and still.',
        'Monitor their breathing and responsiveness.'
      ],
      thingsToAvoid: [
        'Do not move the person unless they are in immediate danger.'
      ],
      urgencyLevel: 'HIGH',
      whenToSeekProfessionalHelp: 'Immediately call emergency services if the situation is life-threatening.',
      safetyDisclaimer: 'This is AI-generated advice and not a substitute for professional medical help.'
    };
  }
}
