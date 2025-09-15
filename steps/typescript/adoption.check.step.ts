import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

const BackgroundCheckInputSchema = z.object({
  applicationId: z.string(),
  petId: z.string(),
  adopterName: z.string().optional(),
  adopterEmail: z.string().optional()
});

export const config: EventConfig<typeof BackgroundCheckInputSchema> = {
  type: 'event',
  name: 'TsBackgroundCheck',
  description: 'Validates adopter history and pet availability in parallel with application summarizer',
  subscribes: ['ts.adoption.applied'],
  emits: ['ts.adoption.background.complete'],
  input: BackgroundCheckInputSchema,
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsBackgroundCheck'] = async (input, { emit, logger }) => {
  const { applicationId, petId, adopterName, adopterEmail } = input;

  logger.info('🔍 Running background check', { applicationId, petId, adopterName });

  // Simulate background check logic
  let checkResult = 'passed';
  let checkDetails = 'All checks passed successfully';

  try {
    // Check pet availability
    const pet = TSStore.get(petId);
    if (!pet) {
      checkResult = 'failed';
      checkDetails = 'Pet not found';
    } else if (pet.status !== 'available') {
      checkResult = 'failed';
      checkDetails = 'Pet is not available for adoption';
    }

    // Check adopter email (simulate spam detection)
    if (adopterEmail && adopterEmail.toLowerCase().includes('spam')) {
      checkResult = 'failed';
      checkDetails = 'Email flagged as potential spam';
    }

    // Check adopter name (simulate basic validation)
    if (adopterName && adopterName.length < 3) {
      checkResult = 'failed';
      checkDetails = 'Adopter name too short';
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    logger.info('Background check completed', { 
      applicationId, 
      petId, 
      checkResult, 
      checkDetails 
    });

    // Emit completion event with check results
    await emit({
      topic: 'ts.adoption.background.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        checkResult,
        checkDetails
      }
    });

  } catch (error) {
    logger.error('Background check failed', { applicationId, petId, error: error.message });
    
    await emit({
      topic: 'ts.adoption.background.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        checkResult: 'error',
        checkDetails: `Check failed: ${error.message}`
      }
    });
  }
};
