// steps/typescript/get-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsGetPet',
  path: '/ts/pets/:id',
  method: 'GET',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler = async (req: any) => {
  const pet = TSStore.get(req.pathParams.id);
  return pet ? { status: 200, body: pet } : { status: 404, body: { message: 'Not found' } };
};
