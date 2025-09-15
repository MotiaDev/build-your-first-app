import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsAdoptionApply',
  path: '/ts/adoptions/apply',
  method: 'POST',
  emits: ['ts.adoption.applied', 'ts.adoption.rejected'],
  flows: ['typescript-adoptions'],
};

export const handler = async (req: any, context?: any) => {
  const { emit, logger } = context || {};
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
  
  if (pet.status === 'adopted') {
    const applicationId = `app-${Date.now()}`;
    
    if (logger) {
      logger.info('🚫 Pet already adopted - triggering recommender', { 
        applicationId, 
        petId, 
        petName: pet.name,
        adopterName,
        adopterEmail 
      });
    }

    // Trigger recommender for alternative pets
    if (emit) {
      await emit({
        topic: 'ts.adoption.rejected',
        data: {
          applicationId,
          petId,
          adopterName,
          adopterEmail,
          rejectionReason: `${pet.name} has already been adopted`
        }
      });
    }

    return { 
      status: 409, 
      body: { 
        message: `${pet.name} has already been adopted. We're finding alternative pets for you...`,
        applicationId,
        status: 'finding_alternatives'
      } 
    };
  }

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

  if (emit) {
    await emit({ 
      topic: 'ts.adoption.applied', 
      data: { 
        applicationId, 
        petId, 
        adopterName,
        adopterEmail
      } 
    });
  }
  
  return { 
    status: 202, 
    body: { 
      applicationId,
      message: `Application submitted for ${pet.name}`,
      status: 'processing'
    } 
  };
};
