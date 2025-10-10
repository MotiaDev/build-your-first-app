// steps/typescript/health-review-agent.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';
import { 
  HEALTH_REVIEW_EMITS, 
  buildAgentContext, 
  callAgentDecision,
  getAgentArtifacts
} from './agent-decision-framework';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsHealthReviewAgent',
  path: '/ts/pets/:id/health-review',
  method: 'POST',
  emits: ['ts.health.treatment_required', 'ts.health.no_treatment_needed'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsHealthReviewAgent'] = async (req, { emit, logger }) => {
  const petId = req.pathParams?.id;

  if (!petId) {
    return { status: 400, body: { message: 'Pet ID is required' } };
  }

  // Get pet
  const pet = TSStore.get(petId);
  if (!pet) {
    return { status: 404, body: { message: 'Pet not found' } };
  }

  if (logger) {
    logger.info('🏥 Health Review Agent triggered', { 
      petId, 
      currentStatus: pet.status,
      symptoms: pet.symptoms || []
    });
  }

  // Check if pet is in a valid state for health review
  if (!['healthy', 'in_quarantine', 'available'].includes(pet.status)) {
    return {
      status: 400,
      body: {
        message: 'Health review can only be performed on healthy, quarantined, or available pets',
        currentStatus: pet.status
      }
    };
  }

  // Build agent context
  const agentContext = buildAgentContext(pet);

  // Check for idempotency - if we have a recent successful decision for this pet in this state
  const recentArtifacts = getAgentArtifacts(petId)
    .filter(a => 
      a.agentType === 'health-review' && 
      a.success && 
      a.inputs.currentStatus === pet.status &&
      (Date.now() - a.timestamp) < 60000 // Within last minute
    );

  if (recentArtifacts.length > 0) {
    const recent = recentArtifacts[recentArtifacts.length - 1];
    if (logger) {
      logger.info('🔄 Idempotent health review - returning cached decision', {
        petId,
        chosenEmit: recent.parsedDecision.chosenEmit,
        timestamp: recent.timestamp
      });
    }

    return {
      status: 200,
      body: {
        message: 'Health review completed (cached)',
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
    if (logger) {
      logger.info('🔍 Starting agent decision call', { petId, agentContext });
    }
    
    // Call agent decision
    const artifact = await callAgentDecision(
      'health-review',
      agentContext,
      HEALTH_REVIEW_EMITS,
      logger
    );
    
    if (logger) {
      logger.info('✅ Agent decision call completed', { petId, success: artifact.success });
    }

    if (!artifact.success) {
      if (logger) {
        logger.warn('⚠️ Agent decision failed, but returning error response', {
          petId,
          error: artifact.error
        });
      }
      
      return {
        status: 500,
        body: {
          message: 'Agent decision failed',
          error: artifact.error,
          petId,
          suggestion: 'Check OpenAI API key and try again'
        }
      };
    }

    // Find the chosen emit
    const chosenEmitDef = HEALTH_REVIEW_EMITS.find(e => e.id === artifact.parsedDecision.chosenEmit);
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
      (emit as any)({
        topic: chosenEmitDef.topic as 'ts.health.treatment_required' | 'ts.health.no_treatment_needed',
        data: {
          petId,
          event: chosenEmitDef.id.replace('emit.', ''), // Convert "emit.health.treatment_required" to "health.treatment_required"
          agentDecision: artifact.parsedDecision,
          timestamp: artifact.timestamp,
          context: agentContext
        }
      });

      if (logger) {
        logger.info('✅ Health review emit fired', {
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
        message: 'Health review completed',
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

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Health review agent error', {
        petId,
        error: error.message
      });
    }

    return {
      status: 500,
      body: {
        message: 'Health review failed',
        error: error.message,
        petId
      }
    };
  }
};
