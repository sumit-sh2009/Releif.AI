import type { RequestPriority, RequestStatus } from '@/types/emergency-request';

export type DisplayUrgency = 'critical' | 'urgent' | 'normal';

export function priorityToUrgency(priority: RequestPriority): DisplayUrgency {
  if (priority === 'CRITICAL') return 'critical';
  if (priority === 'HIGH') return 'urgent';
  return 'normal';
}

export function urgencyToPriority(urgency: string): RequestPriority {
  if (urgency === 'critical') return 'CRITICAL';
  if (urgency === 'urgent') return 'HIGH';
  return 'MEDIUM';
}

export function statusToDisplay(status: RequestStatus): string {
  const map: Record<RequestStatus, string> = {
    PENDING: 'submitted',
    VERIFIED: 'verified',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'on_the_way',
    RESOLVED: 'resolved',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? status.toLowerCase();
}

export const statusLabel: Record<string, string> = {
  submitted: 'Pending review',
  verified: 'Verified',
  assigned: 'Responder assigned',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  assisting: 'Assisting',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
  PENDING: 'Pending review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Responder assigned',
  IN_PROGRESS: 'On the way',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};

export function timeAgo(value: string): string {
  const min = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  return min < 60 ? `${min} min ago` : `${Math.floor(min / 60)} hr ago`;
}

export function generateRequestCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RF-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
