// steps/javascript/adoption.check.step.js
const { get } = require('./js-store');

exports.config = {
  type: 'event',
  name: 'JsBackgroundCheck',
  description: 'Validates adopter history and pet availability in parallel with application summarizer',
  subscribes: ['js.adoption.applied'],
  emits: ['js.adoption.background.complete'],
  flows: ['javascript-adoptions'],
};

exports.handler = async (event, { emit, logger, streams, traceId }) => {
  const { applicationId, petId, adopterName, adopterEmail } = event || {};

  logger.info('🔍 Running background check', { applicationId, petId, adopterName });

  // Update stream to show checking phase
  if (streams?.adoptions && traceId) {
    await streams.adoptions.set(traceId, 'status', {
      entityId: applicationId,
      type: 'application',
      phase: 'checking',
      message: 'Running background check and generating summary',
      timestamp: Date.now(),
      data: { petId, adopterName }
    });
  }

  // Simulate background check logic
  let checkResult = 'passed';
  let checkDetails = 'All checks passed successfully';

  try {
    // Check pet availability
    const pet = get(petId);
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
      topic: 'js.adoption.background.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        checkResult,
        checkDetails,
        traceId
      }
    });

  } catch (error) {
    logger.error('Background check failed', { applicationId, petId, error: error.message });
    
    await emit({
      topic: 'js.adoption.background.complete',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        checkResult: 'error',
        checkDetails: `Check failed: ${error.message}`,
        traceId
      }
    });
  }
};
