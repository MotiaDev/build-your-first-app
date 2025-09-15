// steps/typescript/recommendations.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { PetRecommendationAgent } from './agent';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsRecommendations',
  path: '/ts/recommendations',
  method: 'POST',
  emits: [],
  flows: ['pets_management'],
};

export const handler: Handlers['TsRecommendations'] = async (req, { logger }) => {
  const preferences = (req.body as any) || {};

  // Validate preferences
  if (Object.keys(preferences).length === 0) {
    return {
      status: 400,
      body: { message: 'Please provide adoption preferences (species, age, breed, etc.)' }
    };
  }

  try {
    const recommendations = await PetRecommendationAgent.getRecommendations(preferences, 5);

    if (recommendations.length === 0) {
      return {
        status: 200,
        body: {
          message: 'No pets match your preferences right now',
          recommendations: [],
          preferences
        }
      };
    }

    logger.info('Generated pet recommendations', { 
      preferencesCount: Object.keys(preferences).length,
      matchCount: recommendations.length 
    });

    return {
      status: 200,
      body: {
        message: `Found ${recommendations.length} great matches for you!`,
        recommendations: recommendations.map(match => ({
          pet: {
            id: match.pet.id,
            name: match.pet.name,
            species: match.pet.species,
            breed: match.pet.breed,
            age: match.pet.age,
            status: match.pet.status
          },
          score: match.score,
          reason: match.reason
        })),
        preferences
      }
    };

  } catch (error) {
    logger.error('Failed to generate recommendations', { error: error.message });
    return {
      status: 500,
      body: { message: 'Failed to generate recommendations' }
    };
  }
};