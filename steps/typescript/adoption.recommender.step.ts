import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';
import { PetRecommendationAgent } from './agent';

const RecommenderInputSchema = z.object({
  applicationId: z.string(),
  petId: z.string(),
  adopterName: z.string().optional(),
  adopterEmail: z.string().optional(),
  rejectionReason: z.string().optional(),
  traceId: z.string()
});

export const config: EventConfig<typeof RecommenderInputSchema> = {
  type: 'event',
  name: 'TsRecommender',
  description: 'AI agent that suggests alternative pets when applications are rejected',
  subscribes: ['ts.adoption.rejected'],
  emits: ['ts.adoption.recommendations.sent'],
  input: RecommenderInputSchema,
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsRecommender'] = async (input, { emit, logger, streams, traceId }) => {
  const { applicationId, petId, adopterName, adopterEmail, rejectionReason } = input;

  logger.info('🤖 Generating pet recommendations after rejection', { 
    applicationId, 
    petId, 
    adopterName 
  });

  try {
    // Get the original pet they applied for to understand preferences
    const originalPet = TSStore.get(petId);
    const originalPetName = originalPet ? originalPet.name : 'Unknown Pet';

    // Infer preferences from the original pet choice
    const inferredPreferences = {
      species: originalPet?.species || 'dog',
      maxAge: originalPet ? Math.floor(originalPet.ageMonths / 12) + 2 : 5, // Similar age range
      breed: originalPet?.breed || undefined,
      size: originalPet?.size || undefined
    };

    logger.info('Inferred preferences from original application', {
      applicationId,
      originalPet: originalPetName,
      preferences: inferredPreferences
    });

    // Get recommendations using the agent
    const recommendations = await PetRecommendationAgent.getRecommendations(inferredPreferences, 3);

    // Generate personalized message
    let recommendationMessage = `Hi ${adopterName || 'there'}! `;
    
    if (rejectionReason) {
      recommendationMessage += `While your application for ${originalPetName} couldn't be approved (${rejectionReason}), `;
    } else {
      recommendationMessage += `While your application for ${originalPetName} couldn't be approved at this time, `;
    }

    if (recommendations.length > 0) {
      recommendationMessage += `we found ${recommendations.length} other wonderful ${inferredPreferences.species}${recommendations.length > 1 ? 's' : ''} that might be perfect for you:`;
    } else {
      recommendationMessage += `we encourage you to check back as new pets become available regularly.`;
    }

    // Format recommendations
    const formattedRecommendations = recommendations.map((match, index) => ({
      petId: match.pet.id,
      name: match.pet.name,
      species: match.pet.species,
      breed: match.pet.breed,
      age: match.pet.age,
      ageMonths: match.pet.ageMonths,
      status: match.pet.status,
      score: match.score,
      reason: match.reason,
      rank: index + 1
    }));

    const recommendationData = {
      applicationId,
      originalPetId: petId,
      originalPetName,
      adopterName,
      adopterEmail,
      rejectionReason,
      inferredPreferences,
      recommendations: formattedRecommendations,
      message: recommendationMessage,
      generatedAt: new Date().toISOString()
    };

    logger.info('Pet recommendations generated', {
      applicationId,
      originalPet: originalPetName,
      recommendationCount: recommendations.length,
      topScore: recommendations.length > 0 ? recommendations[0].score : 0
    });

    // Update stream with recommendations
    if (streams?.adoptions && traceId) {
      await streams.adoptions.set(traceId, 'recommendations', {
        entityId: applicationId,
        type: 'recommendations',
        phase: 'recommendations_sent',
        message: `${recommendations.length} alternative pets recommended`,
        timestamp: Date.now(),
        data: recommendationData
      });
    }

    // Emit recommendations
    await emit({
      topic: 'ts.adoption.recommendations.sent',
      data: {
        ...recommendationData,
        traceId
      }
    });

  } catch (error) {
    logger.error('Recommendation generation failed', {
      applicationId,
      petId,
      error: error.message
    });

    // Emit error - still send a basic message
    const fallbackMessage = `Hi ${adopterName || 'there'}! While your application couldn't be approved this time, please don't give up. Check back regularly as new pets become available.`;

    await emit({
      topic: 'ts.adoption.recommendations.sent',
      data: {
        applicationId,
        originalPetId: petId,
        adopterName,
        adopterEmail,
        rejectionReason,
        recommendations: [],
        message: fallbackMessage,
        error: error.message,
        generatedAt: new Date().toISOString(),
        traceId
      }
    });
  }
};
