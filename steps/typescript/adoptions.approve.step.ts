// steps/typescript/adoptions.approve.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsAdoptionApply',
  path: '/ts/adoptions/apply',
  method: 'POST',
  emits: ['ts.adoption.applied'],
  flows: ['pets'],
};

export const handler: Handlers['TsAdoptionApply'] = async (req, { emit, logger }) => {
  const { petId, adopterName, adopterEmail } = (req.body as any) || {};

  // Validate required fields
  if (!petId || !adopterName || !adopterEmail) {
    return {
      status: 400,
      body: { message: 'Missing required fields: petId, adopterName, adopterEmail' }
    };
  }

  // Check if pet exists
  const pet = TSStore.get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };

  // Check if pet is available
  if (pet.status !== 'available') {
    return {
      status: 400,
      body: { message: `Pet is not available (current status: ${pet.status})` }
    };
  }

  // Generate application ID
  const applicationId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  // Update pet status to pending
  TSStore.update(petId, { status: 'pending' });

  logger.info('Application submitted', { applicationId, petId, petName: pet.name, adopterName });

  await emit({
    topic: 'ts.adoption.applied',
    data: { applicationId, petId, petName: pet.name, adopterName, adopterEmail }
  });

  return {
    status: 201,
    body: {
      applicationId,
      petId,
      petName: pet.name,
      status: 'pending_check'
    }
  };
};
