// steps/typescript/test-health-review.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsTestHealthReview',
  path: '/ts/pets/:id/test-health-review',
  method: 'POST',
  flows: ['TsPetManagement']
};

export const handler = async (req: any, context?: any) => {
  const { logger } = context || {};
  const petId = req.pathParams?.id;

  if (logger) {
    logger.info('🧪 Test health review endpoint called', { petId });
  }

  if (!petId) {
    return { status: 400, body: { message: 'Pet ID is required' } };
  }

  // Get pet
  const pet = TSStore.get(petId);
  if (!pet) {
    return { status: 404, body: { message: 'Pet not found' } };
  }

  if (logger) {
    logger.info('✅ Pet found for test', { 
      petId, 
      name: pet.name,
      status: pet.status,
      species: pet.species
    });
  }

  // Check if pet is in a valid state for health review
  if (pet.status !== 'healthy' && pet.status !== 'in_quarantine') {
    return {
      status: 400,
      body: {
        message: 'Health review can only be performed on healthy or quarantined pets',
        currentStatus: pet.status
      }
    };
  }

  // Return success without calling OpenAI
  return {
    status: 200,
    body: {
      message: 'Test health review completed successfully',
      petId,
      petData: {
        name: pet.name,
        species: pet.species,
        status: pet.status,
        ageMonths: pet.ageMonths,
        symptoms: pet.symptoms || [],
        flags: pet.flags || [],
        hasProfile: !!pet.profile
      },
      note: 'This is a test endpoint that bypasses OpenAI API call'
    }
  };
};

