import { Volunteer } from '@/types/volunteer';
import { Database } from '@/lib/database';
import { RequestService } from '../emergency-requests/request-service';

export class VolunteerService {
  constructor(private requestService: RequestService) {}

  async registerVolunteer(data: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'availability'>): Promise<Volunteer> {
    const newVolunteer: Volunteer = {
      ...data,
      id: `vol_${Math.random().toString(36).substr(2, 9)}`,
      availability: 'AVAILABLE',
      status: 'IDLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Database.volunteers.create(newVolunteer);
  }

  async getVolunteerById(id: string): Promise<Volunteer | null> {
    return Database.volunteers.getById(id);
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    return Database.volunteers.getAll();
  }

  async assignToRequest(volunteerId: string, requestId: string): Promise<Volunteer> {
    const volunteer = await this.getVolunteerById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');

    if (volunteer.status !== 'IDLE' || volunteer.availability !== 'AVAILABLE') {
      throw new Error('Volunteer is not available for assignment');
    }

    // Assign in Request Service
    await this.requestService.assignVolunteer(requestId, volunteerId);

    // Update Volunteer status
    const updated = await Database.volunteers.update(volunteerId, {
      status: 'ASSIGNED',
      availability: 'UNAVAILABLE',
      currentRequestId: requestId
    });

    return updated!;
  }

  async completeMission(volunteerId: string): Promise<Volunteer> {
    const volunteer = await this.getVolunteerById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');

    if (!volunteer.currentRequestId) {
      throw new Error('Volunteer has no active mission');
    }

    // Resolve the request
    await this.requestService.updateRequestStatus(volunteer.currentRequestId, 'RESOLVED');

    // Update volunteer
    const updated = await Database.volunteers.update(volunteerId, {
      status: 'IDLE',
      availability: 'AVAILABLE',
      currentRequestId: null
    });

    return updated!;
  }
}
