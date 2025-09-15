// steps/javascript/adoption.summary.step.js
const { get } = require('./js-store');
const { PetRecommendationAgent } = require('./agent');

exports.config = {
  type: 'event',
  name: 'JsApplicationSummarizer',
  description: 'AI agent that summarizes application text in parallel with background check',
  subscribes: ['js.adoption.applied'],
  emits: ['js.adoption.summary.complete'],
  flows: ['javascript-adoptions'],
};

exports.handler = async (event, { emit, logger, streams, traceId }) => {
  const { applicationId, petId, adopterName, adopterEmail } = event || {};

  logger.info('📝 Generating application summary', { applicationId, petId, adopterName });

  try {
    // Get pet information for context
    const pet = get(petId);
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

    // Update stream with summary
    if (streams?.adoptions && traceId) {
      await streams.adoptions.set(traceId, 'summary', {
        entityId: applicationId,
        type: 'application',
        phase: 'summary_ready',
        message: summary,
        timestamp: Date.now(),
        data: { petId, petName, adopterName }
      });
    }

    // Emit completion event with summary
    await emit({
      topic: 'js.adoption.summary.complete',
      data: {
        applicationId,
        petId,
        petName,
        adopterName,
        adopterEmail,
        summary,
        traceId
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
      topic: 'js.adoption.summary.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        summary: fallbackSummary,
        error: error.message,
        traceId
      }
    });
  }
};
