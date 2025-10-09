// steps/javascript/pet-lifecycle-orchestrator.step.js
const { get, updateStatus } = require('./js-store');

const TRANSITION_RULES = [
  {
    from: ['new'],
    to: 'in_quarantine',
    event: 'feeding.reminder.completed',
    description: 'Pet moved to quarantine after feeding setup'
  },
  {
    from: ['in_quarantine'],
    to: 'healthy',
    event: 'status.update.requested',
    description: 'Staff health check - pet cleared from quarantine'
  },
  {
    from: ['healthy', 'in_quarantine', 'available'],
    to: 'ill',
    event: 'status.update.requested',
    description: 'Staff assessment - pet identified as ill'
  },
  {
    from: ['healthy'],
    to: 'available',
    event: 'status.update.requested',
    description: 'Staff decision - pet ready for adoption'
  },
  {
    from: ['ill'],
    to: 'under_treatment',
    event: 'status.update.requested',
    description: 'Staff decision - treatment started'
  },
  {
    from: ['under_treatment', 'ill'],
    to: 'recovered',
    event: 'status.update.requested',
    description: 'Staff assessment - treatment completed'
  },
  {
    from: ['recovered', 'new'],
    to: 'healthy',
    event: 'status.update.requested',
    description: 'Staff clearance - pet fully recovered'
  },
  {
    from: ['available'],
    to: 'pending',
    event: 'status.update.requested',
    description: 'Adoption application received'
  },
  {
    from: ['pending'],
    to: 'adopted',
    event: 'status.update.requested',
    description: 'Adoption completed'
  },
  {
    from: ['pending'],
    to: 'available',
    event: 'status.update.requested',
    description: 'Adoption application rejected/cancelled'
  },
  // Agent-driven health transitions
  {
    from: ['healthy', 'in_quarantine'],
    to: 'ill',
    event: 'health.treatment_required',
    description: 'Agent assessment - pet requires medical treatment'
  },
  {
    from: ['healthy', 'in_quarantine'],
    to: 'healthy',
    event: 'health.no_treatment_needed',
    description: 'Agent assessment - pet remains healthy'
  },
  // Agent-driven adoption transitions
  {
    from: ['healthy'],
    to: 'healthy',
    event: 'adoption.needs_data',
    description: 'Agent assessment - pet needs additional data before adoption',
    flagAction: { action: 'add', flag: 'needs_data' }
  },
  {
    from: ['healthy'],
    to: 'available',
    event: 'adoption.ready',
    description: 'Agent assessment - pet ready for adoption',
    guards: ['no_needs_data_flag']
  }
];

exports.config = {
  type: 'event',
  name: 'JsPetLifecycleOrchestrator',
  description: 'Pet lifecycle state management with staff interaction points',
  subscribes: [
    'js.feeding.reminder.completed',
    'js.pet.status.update.requested',
    'js.health.treatment_required',
    'js.health.no_treatment_needed',
    'js.adoption.needs_data',
    'js.adoption.ready'
  ],
  emits: [
    'js.treatment.required',
    'js.adoption.ready',
    'js.treatment.completed'
  ],
  flows: ['JsPetManagement']
};

// Guard checking functions
const checkGuards = (pet, guards) => {
  for (const guard of guards) {
    if (guard === 'must_be_healthy') {
      if (pet.status !== 'healthy') {
        return { passed: false, reason: `Pet must be healthy (current: ${pet.status})` };
      }
    } else if (guard === 'no_needs_data_flag') {
      if (pet.flags && pet.flags.includes('needs_data')) {
        return { passed: false, reason: 'Pet has needs_data flag blocking adoption' };
      }
    } else {
      return { passed: false, reason: `Unknown guard: ${guard}` };
    }
  }
  return { passed: true };
};

exports.handler = async (input, context) => {
  const { emit, logger } = context || {};
  const { petId, event: eventType, requestedStatus, automatic } = input;

  if (logger) {
    const logMessage = automatic ? '🤖 Automatic progression' : '🔄 Lifecycle orchestrator processing';
    logger.info(logMessage, { petId, eventType, requestedStatus, automatic });
  }

  try {
    const pet = get(petId);
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for lifecycle transition', { petId, eventType });
      }
      return;
    }

    // For status update requests, find the rule based on requested status
    let rule;
    if (eventType === 'status.update.requested' && requestedStatus) {
      rule = TRANSITION_RULES.find(r => 
        r.event === eventType && 
        r.from.includes(pet.status) && 
        r.to === requestedStatus
      );
    } else {
      // For other events (like feeding.reminder.completed)
      rule = TRANSITION_RULES.find(r => 
        r.event === eventType && r.from.includes(pet.status)
      );
    }

    if (!rule) {
      const reason = eventType === 'status.update.requested' 
        ? `Invalid transition: cannot change from ${pet.status} to ${requestedStatus}`
        : `No transition rule found for ${eventType} from ${pet.status}`;
        
      if (logger) {
        logger.warn('⚠️ Transition rejected', { 
          petId, 
          currentStatus: pet.status, 
          requestedStatus,
          eventType,
          reason
        });
      }
      
      // Transition rejected (no emit - no subscribers)
      return;
    }

    // Check guards if present
    if (rule.guards) {
      const guardResult = checkGuards(pet, rule.guards);
      if (!guardResult.passed) {
        if (logger) {
          logger.warn('⚠️ Transition blocked by guard', {
            petId,
            eventType,
            guard: guardResult.reason,
            currentStatus: pet.status
          });
        }

        // Guard check failed, transition rejected (no emit - no subscribers)
        return;
      }
    }

    // Check for idempotency
    if (pet.status === rule.to && !rule.flagAction) {
      if (logger) {
        logger.info('✅ Already in target status', { 
          petId, 
          status: pet.status,
          eventType
        });
      }
      return;
    }

    // Apply the transition
    const oldStatus = pet.status;
    const updatedPet = updateStatus(petId, rule.to);
    
    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to update pet status', { petId, oldStatus, newStatus: rule.to });
      }
      return;
    }

    // Apply flag actions if present
    if (rule.flagAction) {
      const { action, flag } = rule.flagAction;
      if (action === 'add') {
        addFlag(petId, flag);
        if (logger) {
          logger.info('🏷️ Flag added by orchestrator', { petId, flag });
        }
      } else if (action === 'remove') {
        removeFlag(petId, flag);
        if (logger) {
          logger.info('🏷️ Flag removed by orchestrator', { petId, flag });
        }
      }
    }

    if (logger) {
      logger.info('✅ Lifecycle transition completed', {
        petId,
        oldStatus,
        newStatus: rule.to,
        eventType,
        description: rule.description,
        timestamp: Date.now()
      });
    }

    if (emit) {
      // Emit next action events based on status change
      await emitNextActionEvents(petId, rule.to, oldStatus, updatedPet, emit, logger);

      // Check for automatic progressions after successful transition
      await processAutomaticProgression(petId, rule.to, emit, logger);
    }

  } catch (error) {
    if (logger) {
      logger.error('❌ Lifecycle orchestrator error', { petId, eventType, error: error.message });
    }
  }
};

async function emitNextActionEvents(petId, newStatus, oldStatus, pet, emit, logger) {
  try {
    // Emit specific next action events based on status change
    switch (newStatus) {
      case 'under_treatment':
        if (oldStatus === 'ill') {
          await emit({
            topic: 'js.treatment.required',
            data: {
              petId,
              symptoms: pet.symptoms || [],
              urgency: 'normal',
              profile: pet.profile,
              timestamp: Date.now()
            }
          });
          if (logger) {
            logger.info('🏥 Treatment required event emitted', { petId });
          }
        }
        break;

      case 'available':
        if (oldStatus === 'healthy') {
          await emit({
            topic: 'js.adoption.ready',
            data: {
              petId,
              profile: pet.profile,
              temperament: pet.profile?.temperamentTags || [],
              adopterHints: pet.profile?.adopterHints || [],
              timestamp: Date.now()
            }
          });
          if (logger) {
            logger.info('🏠 Adoption ready event emitted', { petId });
          }
        }
        break;

      case 'recovered':
        if (oldStatus === 'under_treatment') {
          await emit({
            topic: 'js.treatment.completed',
            data: {
              petId,
              treatmentType: 'general_recovery',
              treatmentStatus: 'completed',
              timestamp: Date.now()
            }
          });
          if (logger) {
            logger.info('✅ Treatment completed event emitted', { petId });
          }
        }
        break;

      case 'healthy':
        if (oldStatus === 'recovered' && logger) {
          logger.info('💚 Health restored', { petId });
        }
        break;
    }
  } catch (error) {
    if (logger) {
      logger.error('❌ Failed to emit next action events', { petId, newStatus, error: error.message });
    }
  }
}

async function processAutomaticProgression(petId, currentStatus, emit, logger) {
  // Define automatic progressions
  const automaticProgressions = {
    'healthy': { to: 'available', description: 'Automatic progression - pet ready for adoption' },
    'ill': { to: 'under_treatment', description: 'Automatic progression - treatment started' },
    'recovered': { to: 'healthy', description: 'Automatic progression - recovery complete' }
  };

  const progression = automaticProgressions[currentStatus];
  if (progression) {
    if (logger) {
      logger.info('🤖 Processing automatic progression', { 
        petId, 
        currentStatus, 
        nextStatus: progression.to 
      });
    }

    // Find the transition rule for automatic progression
    const rule = TRANSITION_RULES.find(r => 
      r.event === 'status.update.requested' && 
      r.from.includes(currentStatus) && 
      r.to === progression.to
    );

    if (rule) {
      // Apply the automatic transition immediately
      const oldStatus = currentStatus;
      const updatedPet = updateStatus(petId, rule.to);
      
      if (updatedPet) {
        if (logger) {
          logger.info('✅ Automatic progression completed', {
            petId,
            oldStatus,
            newStatus: rule.to,
            description: progression.description,
            timestamp: Date.now()
          });
        }

        if (emit) {
          // Check for further automatic progressions (for chaining like recovered → healthy → available)
          await processAutomaticProgression(petId, rule.to, emit, logger);
        }
      } else if (logger) {
        logger.error('❌ Failed to apply automatic progression', { petId, oldStatus, newStatus: rule.to });
      }
    } else if (logger) {
      logger.warn('⚠️ No transition rule found for automatic progression', { 
        petId, 
        currentStatus, 
        targetStatus: progression.to 
      });
    }
  }
}

