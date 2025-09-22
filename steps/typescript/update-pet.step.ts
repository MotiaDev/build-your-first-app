// steps/typescript/update-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsUpdatePet',
  path: '/ts/pets/:id',
  method: 'PUT',
  emits: [],
  flows: ['pets']
};

export const handler = async (req: any) => {
  const b: any = req.body ?? {};
  const patch: any = {};
  if (typeof b.name === 'string') patch.name = b.name;
  if (['dog','cat','bird','other'].includes(String(b.species))) patch.species = b.species;
  if (Number.isFinite(b.ageMonths)) patch.ageMonths = Number(b.ageMonths);
  if (['new','available','pending','adopted'].includes(String(b.status))) patch.status = b.status;

  const updated = TSStore.update(req.pathParams.id, patch);
  return updated ? { status: 200, body: updated } : { status: 404, body: { message: 'Not found' } };
};
