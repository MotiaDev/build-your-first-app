// src/javascript/pet-lifecycle-orchestrator.step.js
import { get, updateStatus } from './js-store.js'

const TRANSITION_RULES = [
  {
    from: ['new'],
    to: 'in_quarantine',
    event: 'feeding.reminder.completed',
    description: 'Pet moved to quarantine after feeding setup',
  },
  {
    from: ['in_quarantine'],
    to: 'healthy',
    event: 'status.update.requested',
    description: 'Staff health check - pet cleared from quarantine',
  },
  {
    from: ['healthy', 'in_quarantine', 'available'],
    to: 'ill',
    event: 'status.update.requested',
    description: 'Staff assessment - pet identified as ill',
  },
  {
    from: ['healthy'],
    to: 'available',
    event: 'status.update.requested',
    description: 'Staff decision - pet ready for adoption',
  },
  {
    from: ['ill'],
    to: 'under_treatment',
    event: 'status.update.requested',
    description: 'Staff decision - treatment started',
  },
  {
    from: ['under_treatment'],
    to: 'recovered',
    event: 'status.update.requested',
    description: 'Staff assessment - treatment completed',
  },
  {
    from: ['recovered'],
    to: 'healthy',
    event: 'status.update.requested',
    description: 'Staff clearance - pet fully recovered',
  },
  {
    from: ['available'],
    to: 'pending',
    event: 'status.update.requested',
    description: 'Adoption application received',
  },
  {
    from: ['pending'],
    to: 'adopted',
    event: 'status.update.requested',
    description: 'Adoption completed',
  },
  {
    from: ['pending'],
    to: 'available',
    event: 'status.update.requested',
    description: 'Adoption application rejected/cancelled',
  },
]

export const config = {
  type: 'event',
  name: 'JsPetLifecycleOrchestrator',
  description: 'Pet lifecycle state management with staff interaction points',
  subscribes: [
    'js.pet.created',
    'js.feeding.reminder.completed',
    'js.pet.status.update.requested',
  ],
  emits: [],
  flows: ['JsPetManagement'],
}

export const handler = async (input, context) => {
  const { emit, logger } = context || {}
  const { petId, event: eventType, requestedStatus, automatic } = input

  if (logger) {
    const logMessage = automatic
      ? '🤖 Automatic progression'
      : '🔄 Lifecycle orchestrator processing'
    logger.info(logMessage, { petId, eventType, requestedStatus, automatic })
  }

  try {
    const pet = get(petId)
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for lifecycle transition', {
          petId,
          eventType,
        })
      }
      return
    }

    // For status update requests, find the rule based on requested status
    let rule
    if (eventType === 'status.update.requested' && requestedStatus) {
      rule = TRANSITION_RULES.find(
        (r) =>
          r.event === eventType &&
          r.from.includes(pet.status) &&
          r.to === requestedStatus
      )
    } else {
      // For other events (like feeding.reminder.completed)
      rule = TRANSITION_RULES.find(
        (r) => r.event === eventType && r.from.includes(pet.status)
      )
    }

    if (!rule) {
      const reason =
        eventType === 'status.update.requested'
          ? `Invalid transition: cannot change from ${pet.status} to ${requestedStatus}`
          : `No transition rule found for ${eventType} from ${pet.status}`

      if (logger) {
        logger.warn('⚠️ Transition rejected', {
          petId,
          currentStatus: pet.status,
          requestedStatus,
          eventType,
          reason,
        })
      }

      if (emit) {
        await emit({
          topic: 'js.lifecycle.transition.rejected',
          data: {
            petId,
            currentStatus: pet.status,
            requestedStatus,
            eventType,
            reason,
            timestamp: Date.now(),
          },
        })
      }
      return
    }

    // Check for idempotency
    if (pet.status === rule.to) {
      if (logger) {
        logger.info('✅ Already in target status', {
          petId,
          status: pet.status,
          eventType,
        })
      }
      return
    }

    // Apply the transition
    const oldStatus = pet.status
    const updatedPet = updateStatus(petId, rule.to)

    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to update pet status', {
          petId,
          oldStatus,
          newStatus: rule.to,
        })
      }
      return
    }

    if (logger) {
      logger.info('✅ Lifecycle transition completed', {
        petId,
        oldStatus,
        newStatus: rule.to,
        eventType,
        description: rule.description,
        timestamp: Date.now(),
      })
    }

    if (emit) {
      await emit({
        topic: 'js.lifecycle.transition.completed',
        data: {
          petId,
          oldStatus,
          newStatus: rule.to,
          eventType,
          description: rule.description,
          timestamp: Date.now(),
        },
      })

      // Check for automatic progressions after successful transition
      await processAutomaticProgression(petId, rule.to, emit, logger)
    }
  } catch (error) {
    if (logger) {
      logger.error('❌ Lifecycle orchestrator error', {
        petId,
        eventType,
        error: error.message,
      })
    }
  }
}

async function processAutomaticProgression(petId, currentStatus, emit, logger) {
  // Define automatic progressions
  const automaticProgressions = {
    healthy: {
      to: 'available',
      description: 'Automatic progression - pet ready for adoption',
    },
    ill: {
      to: 'under_treatment',
      description: 'Automatic progression - treatment started',
    },
    recovered: {
      to: 'healthy',
      description: 'Automatic progression - recovery complete',
    },
  }

  const progression = automaticProgressions[currentStatus]
  if (progression) {
    if (logger) {
      logger.info('🤖 Processing automatic progression', {
        petId,
        currentStatus,
        nextStatus: progression.to,
      })
    }

    // Find the transition rule for automatic progression
    const rule = TRANSITION_RULES.find(
      (r) =>
        r.event === 'status.update.requested' &&
        r.from.includes(currentStatus) &&
        r.to === progression.to
    )

    if (rule) {
      // Apply the automatic transition immediately
      const oldStatus = currentStatus
      const updatedPet = updateStatus(petId, rule.to)

      if (updatedPet) {
        if (logger) {
          logger.info('✅ Automatic progression completed', {
            petId,
            oldStatus,
            newStatus: rule.to,
            description: progression.description,
            timestamp: Date.now(),
          })
        }

        if (emit) {
          await emit({
            topic: 'js.lifecycle.transition.completed',
            data: {
              petId,
              oldStatus,
              newStatus: rule.to,
              eventType: 'status.update.requested',
              description: progression.description,
              automatic: true,
              timestamp: Date.now(),
            },
          })

          // Check for further automatic progressions (for chaining like recovered → healthy → available)
          await processAutomaticProgression(petId, rule.to, emit, logger)
        }
      } else if (logger) {
        logger.error('❌ Failed to apply automatic progression', {
          petId,
          oldStatus,
          newStatus: rule.to,
        })
      }
    } else if (logger) {
      logger.warn('⚠️ No transition rule found for automatic progression', {
        petId,
        currentStatus,
        targetStatus: progression.to,
      })
    }
  }
}
