// steps/typescript/create-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsCreatePet',
  path: '/ts/pets',
  method: 'POST',
  emits: []
};

export const handler = async (req: any) => {
  const b: any = req.body ?? {};
  const name = typeof b.name === 'string' && b.name.trim();
  const speciesOk = ['dog','cat','bird','other'].includes(b.species);
  const ageOk = Number.isFinite(b.ageMonths);
  if (!name || !speciesOk || !ageOk) {
    return { status: 400, body: { message: 'Invalid payload: {name, species, ageMonths}' } };
  }
  const pet = TSStore.create({ name, species: b.species, ageMonths: Number(b.ageMonths) });
  return { status: 201, body: pet };
};
