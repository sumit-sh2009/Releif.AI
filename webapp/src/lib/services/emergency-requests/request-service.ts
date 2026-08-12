import { EmergencyRequest } from '@/types/emergency-request';
import { Database } from '@/lib/database';

export class RequestService {
  async createRequest(
    data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'requestCode'> & {
      requestCode?: string;
    }
  ): Promise<EmergencyRequest> {
    return Database.emergencyRequests.create({
      ...data,
      peopleAffected: data.peopleAffected ?? 1,
      status: 'PENDING',
    });
  }

  async getRequestById(id: string): Promise<EmergencyRequest | null> {
    return Database.emergencyRequests.getById(id);
  }

  async getRequestByCode(code: string) {
    return Database.emergencyRequests.getByCode(code);
  }

  async getAllRequests(): Promise<EmergencyRequest[]> {
    return Database.emergencyRequests.getAll();
  }

  async updateRequestStatus(id: string, status: EmergencyRequest['status']): Promise<EmergencyRequest | null> {
    return Database.emergencyRequests.update(id, { status });
  }

  async assignVolunteer(requestId: string, volunteerId: string): Promise<EmergencyRequest | null> {
    const req = await this.getRequestById(requestId);
    if (!req) throw new Error('Request not found');

    if (!['PENDING', 'VERIFIED'].includes(req.status)) {
      throw new Error('Can only assign volunteers to pending or verified requests');
    }

    const etaMinutes = 12 + Math.floor(Math.random() * 18);

    return Database.emergencyRequests.update(requestId, {
      assignedVolunteerId: volunteerId,
      status: 'ASSIGNED',
      etaMinutes,
    });
  }
}
