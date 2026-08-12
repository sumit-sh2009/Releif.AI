export type VolunteerAvailability = 'AVAILABLE' | 'UNAVAILABLE';
export type VolunteerStatus = 'IDLE' | 'ASSIGNED' | 'ON_MISSION' | 'OFFLINE';

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  availability: VolunteerAvailability;
  status: VolunteerStatus;
  currentRequestId?: string | null;
  createdAt: string;
  updatedAt: string;
}
