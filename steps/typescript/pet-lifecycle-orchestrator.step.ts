// steps/typescript/pet-lifecycle-orchestrator.step.ts
import { EventConfig, Handlers } from 'motia';
import { TSStore, Pet } from './ts-store';

type LifecycleEvent = 
  | 'pet.created'
  | 'feeding.reminder.completed'
  | 'status.update.requested'
  | 'health.treatment_required'
  | 'health.no_treatment_needed'
  | 'adoption.needs_data'
  | 'adoption.ready';

type TransitionRule = {
  from: Pet["status"][];
  to: Pet["status"];
  event: LifecycleEvent;
  description: string;
  guards?: string[];
  flagAction?: { action: 'add' | 'remove', flag: string };
};

const TRANSITION_RULES: TransitionRule[] = [
  {
    from: ["new"],
    to: "in_quarantine",
    event: "feeding.reminder.completed",
    description: "Pet moved to quarantine after feeding setup"
  },
  {
    from: ["in_quarantine"],
    to: "healthy",
    event: "status.update.requested",
    description: "Staff health check - pet cleared from quarantine"
  },
  {
    from: ["healthy", "in_quarantine", "available"],
    to: "ill",
    event: "status.update.requested",
    description: "Staff assessment - pet identified as ill"
  },
  {
    from: ["healthy"],
    to: "available",
    event: "status.update.requested",
    description: "Staff decision - pet ready for adoption"
  },
  {
    from: ["ill"],
    to: "under_treatment",
    event: "status.update.requested",
    description: "Staff decision - treatment started"
  },
  {
    from: ["under_treatment", "ill"],
    to: "recovered",
    event: "status.update.requested",
    description: "Staff assessment - treatment completed"
  },
  {
    from: ["recovered", "new"],
    to: "healthy",
    event: "status.update.requested",
    description: "Staff clearance - pet fully recovered"
  },
  {
    from: ["available"],
    to: "pending",
    event: "status.update.requested",
    description: "Adoption application received"
  },
  {
    from: ["pending"],
    to: "adopted",
    event: "status.update.requested",
    description: "Adoption completed"
  },
  {
    from: ["pending"],
    to: "available",
    event: "status.update.requested",
    description: "Adoption application rejected/cancelled"
  },
  // Agent-driven health transitions
  {
    from: ["healthy", "in_quarantine"],
    to: "ill",
    event: "health.treatment_required",
    description: "Agent assessment - pet requires medical treatment"
  },
  {
    from: ["healthy", "in_quarantine"],
    to: "healthy",
    event: "health.no_treatment_needed",
    description: "Agent assessment - pet remains healthy"
  },
  // Agent-driven adoption transitions
  {
    from: ["healthy"],
    to: "healthy",
    event: "adoption.needs_data",
    description: "Agent assessment - pet needs additional data before adoption",
    flagAction: { action: 'add', flag: 'needs_data' }
  },
  {
    from: ["healthy"],
    to: "available",
    event: "adoption.ready",
    description: "Agent assessment - pet ready for adoption",
    guards: ['no_needs_data_flag']
  }
];

export const config = {
  type: 'event',
  name: 'TsPetLifecycleOrchestrator',
  description: 'Pet lifecycle state management with staff interaction points',
  subscribes: [
    'ts.feeding.reminder.completed',
    'ts.pet.status.update.requested',
    'ts.health.treatment_required',
    'ts.health.no_treatment_needed',
    'ts.adoption.needs_data',
    'ts.adoption.ready'
  ],
  emits: [
    'ts.treatment.required',
    'ts.adoption.ready',
    'ts.treatment.completed'
  ],
  flows: ['TsPetManagement']
};

// Guard checking functions
const checkGuards = (pet: Pet, guards: string[]): { passed: boolean, reason?: string } => {
  for (const guard of guards) {
    switch (guard) {
      case 'must_be_healthy':
        if (pet.status !== 'healthy') {
          return { passed: false, reason: `Pet must be healthy (current: ${pet.status})` };
        }
        break;
      case 'no_needs_data_flag':
        if (pet.flags?.includes('needs_data')) {
          return { passed: false, reason: 'Pet has needs_data flag blocking adoption' };
        }
        break;
      default:
        return { passed: false, reason: `Unknown guard: ${guard}` };
    }
  }
  return { passed: true };
};

export const handler: Handlers['TsPetLifecycleOrchestrator'] = async (input, { emit, logger, streams, traceId }) => {
  const { petId, event: eventType, requestedStatus, automatic } = input;

  if (logger) {
    const logMessage = automatic ? '🤖 Automatic progression' : '🔄 Lifecycle orchestrator processing';
    logger.info(logMessage, { petId, eventType, requestedStatus, automatic });
  }

  try {
    const pet = TSStore.get(petId);
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for lifecycle transition', { petId, eventType });
      }
      return;
    }

    // Find the appropriate rule based on event type
    let rule;
    if (eventType === 'status.update.requested' && requestedStatus) {
      rule = TRANSITION_RULES.find(r => 
        r.event === eventType && 
        r.from.includes(pet.status) && 
        r.to === requestedStatus
      );
    } else {
      // For other events (feeding.reminder.completed, agent emits)
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
    if (rule.guards && rule.guards.length > 0) {
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
    if (pet.status === rule.to) {
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
    let updatedPet = TSStore.updateStatus(petId, rule.to);
    
    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to update pet status', { petId, oldStatus, newStatus: rule.to });
      }
      return;
    }

    // Apply flag actions if present
    if (rule.flagAction) {
      if (rule.flagAction.action === 'add') {
        updatedPet = TSStore.addFlag(petId, rule.flagAction.flag);
        if (logger) {
          logger.info('🏷️ Flag added', { petId, flag: rule.flagAction.flag });
        }
      } else if (rule.flagAction.action === 'remove') {
        updatedPet = TSStore.removeFlag(petId, rule.flagAction.flag);
        if (logger) {
          logger.info('🏷️ Flag removed', { petId, flag: rule.flagAction.flag });
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

    // Stream the status change
    if (streams?.petCreation && traceId) {
      await streams.petCreation.set(traceId, rule.to, {
        message: `Status transition: ${oldStatus} → ${rule.to} - ${rule.description}`
      } as any);
    }

    if (emit && updatedPet) {
      // Emit next action events based on status change
      await emitNextActionEvents(petId, rule.to, oldStatus, updatedPet, emit, logger);

      // Check for automatic progressions after successful transition
      await processAutomaticProgression(petId, rule.to, emit, logger, streams, traceId);
    }

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Lifecycle orchestrator error', { petId, eventType, error: error.message });
    }
  }
};

async function emitNextActionEvents(petId: string, newStatus: Pet["status"], oldStatus: Pet["status"], pet: Pet, emit: any, logger: any) {
  try {
    // Emit specific next action events based on status change
    switch (newStatus) {
      case 'under_treatment':
        if (oldStatus === 'ill') {
          await emit({
            topic: 'ts.treatment.required',
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
            topic: 'ts.adoption.ready',
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
            topic: 'ts.treatment.completed',
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
  } catch (error: any) {
    if (logger) {
      logger.error('❌ Failed to emit next action events', { petId, newStatus, error: error.message });
    }
  }
}

async function processAutomaticProgression(petId: string, currentStatus: Pet["status"], emit: any, logger: any, streams?: any, traceId?: string) {
  // Define automatic progressions
  const automaticProgressions: Partial<Record<Pet["status"], { to: Pet["status"], description: string }>> = {
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
      // Check guards for automatic progression
      const pet = TSStore.get(petId);
      if (pet && rule.guards && rule.guards.length > 0) {
        const guardResult = checkGuards(pet, rule.guards);
        if (!guardResult.passed) {
          if (logger) {
            logger.warn('⚠️ Automatic progression blocked by guard', {
              petId,
              currentStatus,
              targetStatus: progression.to,
              guard: guardResult.reason
            });
          }
          return;
        }
      }

      // Apply the automatic transition immediately
      const oldStatus = currentStatus;
      let updatedPet = TSStore.updateStatus(petId, rule.to);
      
      if (updatedPet) {
        // Apply flag actions if present
        if (rule.flagAction) {
          if (rule.flagAction.action === 'add') {
            updatedPet = TSStore.addFlag(petId, rule.flagAction.flag);
          } else if (rule.flagAction.action === 'remove') {
            updatedPet = TSStore.removeFlag(petId, rule.flagAction.flag);
          }
        }

        if (logger) {
          logger.info('✅ Automatic progression completed', {
            petId,
            oldStatus,
            newStatus: rule.to,
            description: progression.description,
            timestamp: Date.now()
          });
        }

        // Stream the automatic progression
        if (streams?.petCreation && traceId) {
          await streams.petCreation.set(traceId, rule.to, {
            message: `Automatic: ${oldStatus} → ${rule.to} - ${progression.description}`
          } as any);
        }

        if (emit) {
          // Check for further automatic progressions (for chaining like recovered → healthy → available)
          await processAutomaticProgression(petId, rule.to, emit, logger, streams, traceId);
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

