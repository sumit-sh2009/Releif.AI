export type RequestStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StatusHistoryEntry {
  id: string;
  requestId: string;
  status: RequestStatus;
  note?: string | null;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  requestCode: string;
  requesterPhone?: string | null;
  emergencyType: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  peopleAffected: number;
  priority: RequestPriority;
  status: RequestStatus;
  assignedVolunteerId?: string | null;
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyRequestWithHistory extends EmergencyRequest {
  statusHistory?: StatusHistoryEntry[];
  assignedVolunteer?: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}
