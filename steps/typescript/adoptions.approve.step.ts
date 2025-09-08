// steps/typescript/adoptions.approve.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsApproveAdoption',
  path: '/ts/adoptions/approve',
  method: 'POST',
  emits: ['adoption.approved'],
  flows: ['pets'],
};

export const handler: Handlers['TsApproveAdoption'] = async (req, { emit, logger }) => {
  const petId = String((req.body as any)?.petId || '');
  const pet = TSStore.get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };

  TSStore.update(petId, { status: 'adopted' });
  logger.info('Adoption approved', { petId });

  await emit({ topic: 'adoption.approved', data: { applicationId: `app-${petId}`, petId } });
  return { status: 200, body: { ok: true, petId } };
};
