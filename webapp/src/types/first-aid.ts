export interface FirstAidRequest {
  emergencyDescription: string;
  symptoms?: string;
  situationInformation?: string;
  location?: string;
}

export interface FirstAidResponse {
  immediateSteps: string[];
  thingsToAvoid: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  whenToSeekProfessionalHelp: string;
  safetyDisclaimer: string;
}
