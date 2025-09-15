import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';
import { PetRecommendationAgent } from './agent';

const ApplicationSummarizerInputSchema = z.object({
  applicationId: z.string(),
  petId: z.string(),
  adopterName: z.string().optional(),
  adopterEmail: z.string().optional()
});

export const config: EventConfig<typeof ApplicationSummarizerInputSchema> = {
  type: 'event',
  name: 'TsApplicationSummarizer',
  description: 'AI agent that summarizes application text in parallel with background check',
  subscribes: ['ts.adoption.applied'],
  emits: ['ts.adoption.summary.complete'],
  input: ApplicationSummarizerInputSchema,
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsApplicationSummarizer'] = async (input, { emit, logger }) => {
  const { applicationId, petId, adopterName, adopterEmail } = input;

  logger.info('📝 Generating application summary', { applicationId, petId, adopterName });

  try {
    // Get pet information for context
    const pet = TSStore.get(petId);
    const petName = pet ? pet.name : 'Unknown Pet';
    const petSpecies = pet ? pet.species : 'unknown';

    // Create application data for AI summarization
    const applicationData = {
      applicationId,
      petName,
      petSpecies,
      adopterName: adopterName || 'Unknown Adopter',
      adopterEmail: adopterEmail || 'No email provided',
      checkResult: 'pending' // Will be updated when background check completes
    };

    // Generate AI-powered summary
    const summary = await PetRecommendationAgent.generateApplicationSummary(applicationData);

    logger.info('Application summary generated', { 
      applicationId, 
      petId, 
      summary: summary.substring(0, 100) + '...' 
    });

    // Emit completion event with summary
    await emit({
      topic: 'ts.adoption.summary.complete',
      data: {
        applicationId,
        petId,
        petName,
        adopterName,
        adopterEmail,
        summary
      }
    });

  } catch (error) {
    logger.error('Application summary generation failed', { 
      applicationId, 
      petId, 
      error: error.message 
    });

    // Fallback summary
    const fallbackSummary = `Application ${applicationId} for ${adopterName || 'adopter'} requires review.`;

    await emit({
      topic: 'ts.adoption.summary.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        summary: fallbackSummary,
        error: error.message
      }
    });
  }
};
