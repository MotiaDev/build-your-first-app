// steps/javascript/adoption-review-agent.step.js
const { get } = require('./js-store');
const { 
  ADOPTION_REVIEW_EMITS, 
  buildAgentContext, 
  callAgentDecision,
  getAgentArtifacts
} = require('./agent-decision-framework');

exports.config = {
  type: 'api',
  name: 'JsAdoptionReviewAgent',
  path: '/js/pets/:id/adoption-review',
  method: 'POST',
  emits: ['js.adoption.needs_data', 'js.adoption.ready'],
  flows: ['JsPetManagement']
};

exports.handler = async (req, context) => {
  const { emit, logger } = context || {};
  const petId = req.pathParams?.id;

  if (!petId) {
    return { status: 400, body: { message: 'Pet ID is required' } };
  }

  // Get pet
  const pet = get(petId);
  if (!pet) {
    return { status: 404, body: { message: 'Pet not found' } };
  }

  if (logger) {
    logger.info('🏠 Adoption Review Agent triggered', { 
      petId, 
      currentStatus: pet.status,
      hasProfile: !!pet.profile,
      flags: pet.flags || []
    });
  }

  // Check if pet is in a valid state for adoption review
  if (!['healthy', 'available'].includes(pet.status)) {
    return {
      status: 400,
      body: {
        message: 'Adoption review can only be performed on healthy or available pets',
        currentStatus: pet.status
      }
    };
  }

  // Build agent context
  const agentContext = buildAgentContext(pet);

  // Check for idempotency - if we have a recent successful decision for this pet in this state
  const recentArtifacts = getAgentArtifacts(petId)
    .filter(a => 
      a.agentType === 'adoption-review' && 
      a.success && 
      a.inputs.currentStatus === pet.status &&
      JSON.stringify(a.inputs.flags) === JSON.stringify(pet.flags || []) &&
      (Date.now() - a.timestamp) < 60000 // Within last minute
    );

  if (recentArtifacts.length > 0) {
    const recent = recentArtifacts[recentArtifacts.length - 1];
    if (logger) {
      logger.info('🔄 Idempotent adoption review - returning cached decision', {
        petId,
        chosenEmit: recent.parsedDecision.chosenEmit,
        timestamp: recent.timestamp
      });
    }

    return {
      status: 200,
      body: {
        message: 'Adoption review completed (cached)',
        petId,
        agentDecision: recent.parsedDecision,
        artifact: {
          timestamp: recent.timestamp,
          success: recent.success
        }
      }
    };
  }

  try {
    // Call agent decision
    const artifact = await callAgentDecision(
      'adoption-review',
      agentContext,
      ADOPTION_REVIEW_EMITS,
      logger
    );

    if (!artifact.success) {
      return {
        status: 500,
        body: {
          message: 'Agent decision failed',
          error: artifact.error,
          petId
        }
      };
    }

    // Find the chosen emit
    const chosenEmitDef = ADOPTION_REVIEW_EMITS.find(e => e.id === artifact.parsedDecision.chosenEmit);
    if (!chosenEmitDef) {
      return {
        status: 500,
        body: {
          message: 'Invalid emit chosen by agent',
          chosenEmit: artifact.parsedDecision.chosenEmit
        }
      };
    }

    // Fire the chosen emit
    if (emit) {
      await emit({
        topic: chosenEmitDef.topic,
        data: {
          petId,
          agentDecision: artifact.parsedDecision,
          timestamp: artifact.timestamp,
          context: agentContext
        }
      });

      if (logger) {
        logger.info('✅ Adoption review emit fired', {
          petId,
          chosenEmit: artifact.parsedDecision.chosenEmit,
          topic: chosenEmitDef.topic,
          rationale: artifact.parsedDecision.rationale
        });
      }
    }

    return {
      status: 200,
      body: {
        message: 'Adoption review completed',
        petId,
        agentDecision: artifact.parsedDecision,
        emitFired: chosenEmitDef.topic,
        artifact: {
          timestamp: artifact.timestamp,
          success: artifact.success,
          availableEmits: artifact.availableEmits.map(e => e.id)
        }
      }
    };

  } catch (error) {
    if (logger) {
      logger.error('❌ Adoption review agent error', {
        petId,
        error: error.message
      });
    }

    return {
      status: 500,
      body: {
        message: 'Adoption review failed',
        error: error.message,
        petId
      }
    };
  }
};
