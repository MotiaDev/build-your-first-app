// steps/typescript/create-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsCreatePet',
  path: '/ts/pets',
  method: 'POST',
  emits: ['ts.pet.created', 'ts.feeding.reminder.enqueued'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsCreatePet'] = async (req, { emit, logger, streams, traceId }) => {
  const b: any = req.body ?? {};
  const name = typeof b.name === 'string' && b.name.trim();
  const speciesOk = ['dog','cat','bird','other'].includes(b.species);
  const ageOk = Number.isFinite(b.ageMonths);
  
  if (!name || !speciesOk || !ageOk) {
    return { status: 400, body: { message: 'Invalid payload: {name, species, ageMonths}' } };
  }

  // Create the pet
  const pet = TSStore.create({ 
    name, 
    species: b.species, 
    ageMonths: Number(b.ageMonths),
    weightKg: typeof b.weightKg === 'number' ? b.weightKg : undefined,
    symptoms: Array.isArray(b.symptoms) ? b.symptoms : undefined
  });
  
  if (logger) {
    logger.info('🐾 Pet created', { petId: pet.id, name: pet.name, species: pet.species, status: pet.status });
  }

  // Create & return the initial stream record (following working pattern)
  const result = await streams.petCreation.set(traceId, 'message', { 
    message: `Pet ${pet.name} (ID: ${pet.id}) created successfully - Species: ${pet.species}, Age: ${pet.ageMonths} months, Status: ${pet.status}` 
  });

  if (emit) {
    await emit({
      topic: 'ts.pet.created',
      data: { petId: pet.id, event: 'pet.created', name: pet.name, species: pet.species, traceId }
    } as any);
    
    // Enqueue feeding reminder background job
    await emit({
      topic: 'ts.feeding.reminder.enqueued',
      data: { petId: pet.id, enqueuedAt: Date.now(), traceId }
    } as any);
  }

  return { 
    status: 201, 
    body: result 
  };
};
