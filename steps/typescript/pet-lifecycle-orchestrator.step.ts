// steps/typescript/pet-lifecycle-orchestrator.step.ts
import { TSStore, Pet } from './ts-store';

type LifecycleEvent = 
  | 'pet.created'
  | 'feeding.reminder.completed'
  | 'status.update.requested';

type TransitionRule = {
  from: Pet["status"][];
  to: Pet["status"];
  event: LifecycleEvent;
  description: string;
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
    from: ["under_treatment"],
    to: "recovered",
    event: "status.update.requested",
    description: "Staff assessment - treatment completed"
  },
  {
    from: ["recovered"],
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
  }
];

export const config = {
  type: 'event',
  name: 'TsPetLifecycleOrchestrator',
  description: 'Pet lifecycle state management with staff interaction points',
  subscribes: ['ts.pet.created', 'ts.feeding.reminder.completed', 'ts.pet.status.update.requested'],
  emits: [],
  flows: ['TsPetManagement']
};

export const handler = async (input: any, context?: any) => {
  const { emit, logger } = context || {};
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
      
      // Transition rejected - no event emission needed
      return;
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
    const updatedPet = TSStore.updateStatus(petId, rule.to);
    
    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to update pet status', { petId, oldStatus, newStatus: rule.to });
      }
      return;
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

    // Transition completed successfully
    if (logger) {
      logger.info('✅ Pet status transition completed', { 
        petId, 
        oldStatus, 
        newStatus: rule.to, 
        eventType, 
        description: rule.description 
      });
    }

    // Check for automatic progressions after successful transition
    await processAutomaticProgression(petId, rule.to, emit, logger);

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Lifecycle orchestrator error', { petId, eventType, error: error.message });
    }
  }
};

async function processAutomaticProgression(petId: string, currentStatus: Pet["status"], emit: any, logger: any) {
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
      // Apply the automatic transition immediately
      const oldStatus = currentStatus;
      const updatedPet = TSStore.updateStatus(petId, rule.to);
      
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

        // Automatic progression completed successfully
        if (logger) {
          logger.info('✅ Automatic progression completed', { 
            petId, 
            oldStatus, 
            newStatus: rule.to, 
            description: progression.description 
          });
        }

        // Check for further automatic progressions (for chaining like recovered → healthy → available)
        await processAutomaticProgression(petId, rule.to, emit, logger);
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

