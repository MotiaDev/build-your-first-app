import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsAdoptionApply',
  path: '/ts/adoptions/apply',
  method: 'POST',
  emits: ['ts.adoption.applied'],
  flows: ['typescript-adoptions'],
};

export const handler = async (req: any, context?: any) => {
  const { emit, logger, streams, traceId } = context || {};
  const b: any = req.body ?? {};
  const petId = String(b.petId || '');
  const adopterName = String(b.adopterName || '');
  const adopterEmail = String(b.adopterEmail || '');
  
  // Validate required fields
  if (!petId) return { status: 400, body: { message: 'petId is required' } };
  if (!adopterName) return { status: 400, body: { message: 'adopterName is required' } };
  if (!adopterEmail) return { status: 400, body: { message: 'adopterEmail is required' } };
  
  const pet = TSStore.get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };
  if (pet.status === 'adopted') return { status: 409, body: { message: 'Pet already adopted' } };

  const applicationId = `app-${Date.now()}`;
  
  if (logger) {
    logger.info('📋 Adoption application received', { 
      applicationId, 
      petId, 
      petName: pet.name,
      adopterName,
      adopterEmail 
    });
  }

  // Create & return the initial stream record keyed by traceId
  let record = null;
  if (streams?.adoptions && traceId) {
    record = await streams.adoptions.set(traceId, 'status', {
      entityId: applicationId,
      type: 'application',
      phase: 'applied',
      message: `${adopterName} applied to adopt ${pet.name}`,
      timestamp: Date.now(),
      data: { 
        petId, 
        petName: pet.name, 
        petSpecies: pet.species,
        adopterName,
        adopterEmail 
      }
    });
  }

  if (emit) {
    await emit({ 
      topic: 'ts.adoption.applied', 
      data: { 
        applicationId, 
        petId, 
        adopterName,
        adopterEmail,
        traceId 
      } 
    });
  }
  
  return { 
    status: 202, 
    body: record || { 
      entityId: applicationId, 
      type: 'application', 
      phase: 'applied',
      traceId 
    } 
  };
};
