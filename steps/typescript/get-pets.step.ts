// steps/typescript/get-pets.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsListPets',
  path: '/ts/pets',
  method: 'GET',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler = async () => {
  return { status: 200, body: TSStore.list() };
};
