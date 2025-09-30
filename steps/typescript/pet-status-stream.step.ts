// steps/typescript/pet-status-stream.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsPetStatusStream',
  path: '/ts/pets/status-stream',
  method: 'POST',
  emits: ['ts.pet.status.update.requested'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsPetStatusStream'] = async (req, { emit, logger, streams, traceId }) => {
  const b: any = req.body ?? {};
  const petId = String(b.petId || '');
  const newStatus = String(b.status || '');
  
  // Validate required fields
  if (!petId) return { status: 400, body: { message: 'petId is required' } };
  if (!newStatus) return { status: 400, body: { message: 'status is required' } };
  
  const pet = TSStore.get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };
  
  if (logger) {
    logger.info('📋 Pet status update requested', { 
      petId, 
      petName: pet.name,
      oldStatus: pet.status,
      newStatus
    });
  }

  // Create & return the initial stream record keyed by traceId
  let record = null;
  if (streams?.petCreation && traceId) {
    record = await streams.petCreation.set(traceId, 'status_update', {
      entityId: petId,
      type: 'pet',
      phase: 'status_update_requested',
      message: `Status update requested: ${pet.status} → ${newStatus}`,
      timestamp: Date.now(),
      data: { 
        petId, 
        petName: pet.name, 
        petSpecies: pet.species,
        oldStatus: pet.status,
        newStatus
      }
    });
  }

  if (emit) {
    await emit({ 
      topic: 'ts.pet.status.update.requested', 
      data: { 
        petId, 
        event: 'status.update.requested',
        requestedStatus: newStatus,
        traceId 
      } 
    });
  }
  
  return { 
    status: 202, 
    body: record || { 
      entityId: petId, 
      type: 'pet', 
      phase: 'status_update_requested',
      traceId 
    } 
  };
};


