// steps/typescript/delete-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsDeletePet',
  path: '/ts/pets/:id',
  method: 'DELETE',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler = async (req: any) => {
  const ok = TSStore.remove(req.pathParams.id);
  return ok ? { status: 204, body: {} } : { status: 404, body: { message: 'Not found' } };
};
