import type {
  EmergencyRequest as PrismaEmergencyRequest,
  Volunteer as PrismaVolunteer,
  Prediction as PrismaPrediction,
  StatusHistoryEntry as PrismaStatusHistoryEntry,
  ActivityLog as PrismaActivityLog,
  RequestStatus,
  RequestPriority,
  VolunteerAvailability,
  VolunteerStatus,
} from '@prisma/client';
import { EmergencyRequest, StatusHistoryEntry, EmergencyRequestWithHistory } from '@/types/emergency-request';
import { Volunteer } from '@/types/volunteer';
import { PredictionResult } from '@/types/prediction';
import { prisma } from '@/lib/prisma';
import { generateRequestCode } from '@/lib/format';

function toEmergencyRequest(row: PrismaEmergencyRequest): EmergencyRequest {
  return {
    id: row.id,
    requestCode: row.requestCode,
    requesterPhone: row.requesterPhone,
    emergencyType: row.emergencyType,
    description: row.description,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    peopleAffected: row.peopleAffected,
    priority: row.priority as EmergencyRequest['priority'],
    status: row.status as EmergencyRequest['status'],
    assignedVolunteerId: row.assignedVolunteerId,
    etaMinutes: row.etaMinutes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toVolunteer(row: PrismaVolunteer): Volunteer {
  return {
    id: row.id,
    name: row.name,
    skills: row.skills,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    availability: row.availability as Volunteer['availability'],
    status: row.status as Volunteer['status'],
    currentRequestId: row.currentRequestId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPrediction(row: PrismaPrediction): PredictionResult {
  return {
    id: row.id,
    disasterType: row.disasterType,
    location: row.location,
    probability: row.probability,
    severity: row.severity as PredictionResult['severity'],
    predictedTime: row.predictedTime.toISOString(),
    affectedArea: row.affectedArea ?? '',
    estimatedPeopleAffected: row.estimatedPeopleAffected ?? 0,
    confidence: row.confidence,
    createdAt: row.createdAt.toISOString(),
    modelVersion: row.modelVersion,
  };
}

function toStatusHistory(row: PrismaStatusHistoryEntry): StatusHistoryEntry {
  return {
    id: row.id,
    requestId: row.requestId,
    status: row.status as StatusHistoryEntry['status'],
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

async function logActivity(message: string, type = 'system') {
  await prisma.activityLog.create({ data: { message, type } });
}

async function addStatusHistory(requestId: string, status: RequestStatus, note?: string) {
  await prisma.statusHistoryEntry.create({
    data: { requestId, status, note },
  });
}

export const Database = {
  predictions: {
    getAll: async (): Promise<PredictionResult[]> => {
      const rows = await prisma.prediction.findMany({ orderBy: { createdAt: 'desc' } });
      return rows.map(toPrediction);
    },
    getById: async (id: string): Promise<PredictionResult | null> => {
      const row = await prisma.prediction.findUnique({ where: { id } });
      return row ? toPrediction(row) : null;
    },
    create: async (prediction: PredictionResult): Promise<PredictionResult> => {
      const row = await prisma.prediction.create({
        data: {
          id: prediction.id,
          disasterType: prediction.disasterType,
          location: prediction.location,
          probability: prediction.probability,
          severity: prediction.severity,
          predictedTime: new Date(prediction.predictedTime),
          affectedArea: prediction.affectedArea,
          estimatedPeopleAffected: prediction.estimatedPeopleAffected,
          confidence: prediction.confidence,
          modelVersion: prediction.modelVersion,
        },
      });
      await logActivity(`New ${prediction.disasterType} prediction for ${prediction.location} (${prediction.probability}%)`, 'prediction');
      return toPrediction(row);
    },
  },

  emergencyRequests: {
    getAll: async (): Promise<EmergencyRequest[]> => {
      const rows = await prisma.emergencyRequest.findMany({ orderBy: { createdAt: 'desc' } });
      return rows.map(toEmergencyRequest);
    },
    getById: async (id: string): Promise<EmergencyRequest | null> => {
      const row = await prisma.emergencyRequest.findUnique({ where: { id } });
      return row ? toEmergencyRequest(row) : null;
    },
    getByCode: async (code: string): Promise<EmergencyRequestWithHistory | null> => {
      const row = await prisma.emergencyRequest.findUnique({
        where: { requestCode: code.toUpperCase() },
        include: {
          statusHistory: { orderBy: { createdAt: 'asc' } },
          assignedVolunteer: { select: { id: true, name: true, latitude: true, longitude: true } },
        },
      });
      if (!row) return null;
      return {
        ...toEmergencyRequest(row),
        statusHistory: row.statusHistory.map(toStatusHistory),
        assignedVolunteer: row.assignedVolunteer,
      };
    },
    create: async (
      data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'requestCode'> & { requestCode?: string }
    ): Promise<EmergencyRequest> => {
      let requestCode = data.requestCode ?? generateRequestCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const row = await prisma.emergencyRequest.create({
            data: {
              requestCode,
              emergencyType: data.emergencyType,
              description: data.description,
              location: data.location,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
              peopleAffected: data.peopleAffected ?? 1,
              priority: data.priority as RequestPriority,
              status: (data.status ?? 'PENDING') as RequestStatus,
              requesterPhone: data.requesterPhone ?? null,
              assignedVolunteerId: data.assignedVolunteerId ?? null,
              etaMinutes: data.etaMinutes ?? null,
            },
          });
          await addStatusHistory(row.id, row.status, 'Request submitted');
          await logActivity(`New emergency request ${requestCode}: ${data.emergencyType} at ${data.location}`, 'emergency');
          return toEmergencyRequest(row);
        } catch (err: unknown) {
          const isUnique =
            err &&
            typeof err === 'object' &&
            'code' in err &&
            (err as { code: string }).code === 'P2002';
          if (!isUnique) throw err;
          requestCode = generateRequestCode();
        }
      }
      throw new Error('Failed to generate unique request code');
    },
    update: async (id: string, updates: Partial<EmergencyRequest>): Promise<EmergencyRequest | null> => {
      const existing = await prisma.emergencyRequest.findUnique({ where: { id } });
      if (!existing) return null;

      const row = await prisma.emergencyRequest.update({
        where: { id },
        data: {
          ...(updates.emergencyType !== undefined && { emergencyType: updates.emergencyType }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.location !== undefined && { location: updates.location }),
          ...(updates.latitude !== undefined && { latitude: updates.latitude }),
          ...(updates.longitude !== undefined && { longitude: updates.longitude }),
          ...(updates.peopleAffected !== undefined && { peopleAffected: updates.peopleAffected }),
          ...(updates.priority !== undefined && { priority: updates.priority as RequestPriority }),
          ...(updates.status !== undefined && { status: updates.status as RequestStatus }),
          ...(updates.requesterPhone !== undefined && { requesterPhone: updates.requesterPhone }),
          ...(updates.assignedVolunteerId !== undefined && { assignedVolunteerId: updates.assignedVolunteerId }),
          ...(updates.etaMinutes !== undefined && { etaMinutes: updates.etaMinutes }),
        },
      });

      if (updates.status && updates.status !== existing.status) {
        await addStatusHistory(id, updates.status as RequestStatus);
        await logActivity(`Request ${existing.requestCode} status → ${updates.status}`, 'emergency');
      }

      return toEmergencyRequest(row);
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        await prisma.emergencyRequest.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  },

  volunteers: {
    getAll: async (): Promise<Volunteer[]> => {
      const rows = await prisma.volunteer.findMany({ orderBy: { name: 'asc' } });
      return rows.map(toVolunteer);
    },
    getById: async (id: string): Promise<Volunteer | null> => {
      const row = await prisma.volunteer.findUnique({ where: { id } });
      return row ? toVolunteer(row) : null;
    },
    create: async (volunteer: Volunteer): Promise<Volunteer> => {
      const row = await prisma.volunteer.create({
        data: {
          id: volunteer.id,
          name: volunteer.name,
          skills: volunteer.skills,
          location: volunteer.location,
          latitude: volunteer.latitude ?? null,
          longitude: volunteer.longitude ?? null,
          availability: volunteer.availability as VolunteerAvailability,
          status: volunteer.status as VolunteerStatus,
          currentRequestId: volunteer.currentRequestId ?? null,
        },
      });
      return toVolunteer(row);
    },
    update: async (id: string, updates: Partial<Volunteer>): Promise<Volunteer | null> => {
      try {
        const row = await prisma.volunteer.update({
          where: { id },
          data: {
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.skills !== undefined && { skills: updates.skills }),
            ...(updates.location !== undefined && { location: updates.location }),
            ...(updates.latitude !== undefined && { latitude: updates.latitude }),
            ...(updates.longitude !== undefined && { longitude: updates.longitude }),
            ...(updates.availability !== undefined && {
              availability: updates.availability as VolunteerAvailability,
            }),
            ...(updates.status !== undefined && { status: updates.status as VolunteerStatus }),
            ...(updates.currentRequestId !== undefined && { currentRequestId: updates.currentRequestId }),
          },
        });
        return toVolunteer(row);
      } catch {
        return null;
      }
    },
    getAvailable: async (): Promise<Volunteer[]> => {
      const rows = await prisma.volunteer.findMany({
        where: { availability: 'AVAILABLE', status: 'IDLE' },
      });
      return rows.map(toVolunteer);
    },
  },

  activity: {
    getRecent: async (limit = 10) => {
      const rows = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return rows.map((r: PrismaActivityLog) => ({
        id: r.id,
        message: r.message,
        type: r.type,
        createdAt: r.createdAt.toISOString(),
      }));
    },
  },
};
