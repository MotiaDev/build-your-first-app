// steps/typescript/get-pets.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsListPets',
  path: '/ts/pets',
  method: 'GET',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsListPets'] = async (req, { logger }) => {
  try {
    const pets = TSStore.list();
    return { status: 200, body: pets };
  } catch (error) {
    return {
      status: 500,
      body: { message: 'Internal server error' }
    };
  }
};