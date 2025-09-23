// steps/typescript/update-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsUpdatePet',
  path: '/ts/pets/:id',
  method: 'PUT',
  emits: ['ts.pet.status.update.requested'],
  flows: ['TsPetManagement']
};

export const handler = async (req: any, context?: any) => {
  const { emit, logger } = context || {};
  const b: any = req.body ?? {};
  const petId = req.pathParams.id;
  
  // Check if pet exists
  const currentPet = TSStore.get(petId);
  if (!currentPet) {
    return { status: 404, body: { message: 'Not found' } };
  }

  // Handle status updates through orchestrator
  if (b.status && b.status !== currentPet.status) {
    const validStatuses = ['new','in_quarantine','healthy','available','pending','adopted','ill','under_treatment','recovered','deleted'];
    
    if (!validStatuses.includes(String(b.status))) {
      return { status: 400, body: { message: 'Invalid status' } };
    }

    if (logger) {
      logger.info('👤 Staff requesting status change', { 
        petId, 
        currentStatus: currentPet.status, 
        requestedStatus: b.status 
      });
    }

    // Emit to orchestrator for validation and processing
    if (emit) {
      await emit({
        topic: 'ts.pet.status.update.requested',
        data: { 
          petId, 
          event: 'status.update.requested',
          requestedStatus: b.status,
          currentStatus: currentPet.status
        }
      });
    }

    // Return current pet - orchestrator will handle the actual status change
    return { status: 202, body: { 
      message: 'Status change request submitted',
      petId,
      currentStatus: currentPet.status,
      requestedStatus: b.status
    }};
  }

  // Handle non-status updates normally
  const patch: any = {};
  if (typeof b.name === 'string') patch.name = b.name;
  if (['dog','cat','bird','other'].includes(String(b.species))) patch.species = b.species;
  if (Number.isFinite(b.ageMonths)) patch.ageMonths = Number(b.ageMonths);
  if (typeof b.notes === 'string') patch.notes = b.notes;
  if (Number.isFinite(b.nextFeedingAt)) patch.nextFeedingAt = Number(b.nextFeedingAt);

  const updated = TSStore.update(petId, patch);
  return updated ? { status: 200, body: updated } : { status: 404, body: { message: 'Not found' } };
};
