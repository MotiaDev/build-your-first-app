// steps/javascript/adoption.recommender.step.js
const { get } = require('./js-store');
const { PetRecommendationAgent } = require('./agent');

exports.config = {
  type: 'event',
  name: 'JsRecommender',
  description: 'AI agent that suggests alternative pets when applications are rejected',
  subscribes: ['js.adoption.rejected'],
  emits: ['js.adoption.recommendations.sent'],
  flows: ['javascript-adoptions'],
};

exports.handler = async (event, { emit, logger }) => {
  const { applicationId, petId, adopterName, adopterEmail, rejectionReason } = event || {};

  logger.info('🤖 Generating pet recommendations after rejection', { 
    applicationId, 
    petId, 
    adopterName 
  });

  try {
    // Get the original pet they applied for to understand preferences
    const originalPet = get(petId);
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

    // Emit recommendations
    await emit({
      topic: 'js.adoption.recommendations.sent',
      data: recommendationData
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
      topic: 'js.adoption.recommendations.sent',
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
      }
    });
  }
};
