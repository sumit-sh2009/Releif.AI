import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.statusHistoryEntry.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.activityLog.deleteMany();

  const volunteers = await Promise.all([
    prisma.volunteer.create({
      data: {
        id: 'v1',
        name: 'Alex Morgan',
        skills: ['Medical', 'Rescue'],
        location: 'Riverside District',
        latitude: 19.081,
        longitude: 72.882,
        availability: 'UNAVAILABLE',
        status: 'ON_MISSION',
      },
    }),
    prisma.volunteer.create({
      data: {
        id: 'v2',
        name: 'Priya Nair',
        skills: ['Water', 'Shelter'],
        location: 'Sector B',
        latitude: 19.071,
        longitude: 72.865,
        availability: 'AVAILABLE',
        status: 'IDLE',
      },
    }),
    prisma.volunteer.create({
      data: {
        id: 'v3',
        name: 'Jordan Lee',
        skills: ['Rescue', 'Logistics'],
        location: 'North Hills',
        latitude: 19.09,
        longitude: 72.9,
        availability: 'AVAILABLE',
        status: 'IDLE',
      },
    }),
    prisma.volunteer.create({
      data: {
        id: 'v4',
        name: 'Samira Khan',
        skills: ['Medical'],
        location: 'Sector C',
        latitude: 19.065,
        longitude: 72.89,
        availability: 'AVAILABLE',
        status: 'IDLE',
      },
    }),
  ]);

  const now = Date.now();
  const requests = [
    {
      requestCode: 'RF-7K29X4P1',
      emergencyType: 'Medical Assistance',
      description: 'Water rising fast near the building, one elderly person needs medical attention.',
      location: 'Riverside District',
      latitude: 19.078,
      longitude: 72.875,
      peopleAffected: 4,
      priority: 'CRITICAL' as const,
      status: 'IN_PROGRESS' as const,
      requesterPhone: '+919876543210',
      assignedVolunteerId: volunteers[0].id,
      etaMinutes: 12,
      createdAt: new Date(now - 8 * 60000),
    },
    {
      requestCode: 'RF-3M81QZXA',
      emergencyType: 'Water Level Rise',
      description: 'River level rising rapidly in residential area.',
      location: 'Sector B',
      latitude: 19.072,
      longitude: 72.868,
      peopleAffected: 11,
      priority: 'HIGH' as const,
      status: 'VERIFIED' as const,
      createdAt: new Date(now - 22 * 60000),
    },
    {
      requestCode: 'RF-9J44LWYT',
      emergencyType: 'Supply Route Blocked',
      description: 'Main supply route blocked by debris.',
      location: 'Route H-4',
      latitude: 19.085,
      longitude: 72.89,
      peopleAffected: 0,
      priority: 'HIGH' as const,
      status: 'PENDING' as const,
      createdAt: new Date(now - 60 * 60000),
    },
    {
      requestCode: 'RF-5D62NPKX',
      emergencyType: 'Rescue Operation',
      description: 'Family trapped on upper floor, water at window level.',
      location: 'Riverside District',
      latitude: 19.076,
      longitude: 72.877,
      peopleAffected: 6,
      priority: 'CRITICAL' as const,
      status: 'ASSIGNED' as const,
      assignedVolunteerId: volunteers[1].id,
      etaMinutes: 18,
      createdAt: new Date(now - 14 * 60000),
    },
    {
      requestCode: 'RF-2B77VTHQ',
      emergencyType: 'Medical Evac Required',
      description: 'Patient needs urgent evacuation to hospital.',
      location: 'Sector C',
      latitude: 19.068,
      longitude: 72.892,
      peopleAffected: 1,
      priority: 'CRITICAL' as const,
      status: 'PENDING' as const,
      createdAt: new Date(now - 3 * 60000),
    },
    {
      requestCode: 'RF-8H15WCRE',
      emergencyType: 'Landslide Response',
      description: 'Road blocked, families cut off from supplies.',
      location: 'North Hills',
      latitude: 19.092,
      longitude: 72.905,
      peopleAffected: 5,
      priority: 'HIGH' as const,
      status: 'VERIFIED' as const,
      createdAt: new Date(now - 40 * 60000),
    },
  ];

  for (const req of requests) {
    const { createdAt, ...data } = req;
    const row = await prisma.emergencyRequest.create({
      data: { ...data, createdAt },
    });
    await prisma.statusHistoryEntry.create({
      data: { requestId: row.id, status: 'PENDING', note: 'Request submitted', createdAt },
    });
    if (data.status !== 'PENDING') {
      await prisma.statusHistoryEntry.create({
        data: { requestId: row.id, status: data.status },
      });
    }
  }

  await prisma.volunteer.update({
    where: { id: 'v1' },
    data: { currentRequestId: (await prisma.emergencyRequest.findUnique({ where: { requestCode: 'RF-7K29X4P1' } }))!.id },
  });

  await prisma.prediction.create({
    data: {
      disasterType: 'Flood',
      location: 'Riverside District',
      probability: 82,
      severity: 'HIGH',
      predictedTime: new Date(now + 24 * 3600000),
      affectedArea: '14 areas',
      estimatedPeopleAffected: 3842,
      confidence: 87,
      modelVersion: 'reliefai-v1',
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { message: 'New critical emergency reported', type: 'emergency' },
      { message: 'Volunteer Alex assigned to RF-7K29X4P1', type: 'dispatch' },
      { message: 'Flood risk increased to HIGH', type: 'prediction' },
      { message: 'Emergency request resolved', type: 'emergency' },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
