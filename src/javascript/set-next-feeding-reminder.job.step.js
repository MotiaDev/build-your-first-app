// steps/javascript/set-next-feeding-reminder.job.step.js
import { update } from './js-store.js'

export const config = {
  type: 'event',
  name: 'JsSetNextFeedingReminder',
  description:
    'Background job that sets next feeding reminder and adds welcome notes',
  subscribes: ['js.feeding.reminder.enqueued'],
  emits: [],
  flows: ['JsPetManagement'],
}

export const handler = async (input, context) => {
  const { emit, logger } = context || {}
  const { petId, enqueuedAt } = input

  if (logger) {
    logger.info('🔄 Setting next feeding reminder', { petId, enqueuedAt })
  }

  try {
    // Calculate next feeding time (24 hours from now)
    const nextFeedingAt = Date.now() + 24 * 60 * 60 * 1000

    // Fill in non-critical details
    const updates = {
      notes: "Welcome to our pet store! We'll take great care of this pet.",
      nextFeedingAt: nextFeedingAt,
    }

    const updatedPet = update(petId, updates)

    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to set feeding reminder - pet not found', {
          petId,
        })
      }
      return
    }

    if (logger) {
      logger.info('✅ Next feeding reminder set', {
        petId,
        notes: updatedPet.notes?.substring(0, 50) + '...',
        nextFeedingAt: new Date(nextFeedingAt).toISOString(),
      })
    }

    if (emit) {
      await emit({
        topic: 'js.feeding.reminder.completed',
        data: {
          petId,
          completedAt: Date.now(),
          processingTimeMs: Date.now() - enqueuedAt,
        },
      })
    }
  } catch (error) {
    if (logger) {
      logger.error('❌ Feeding reminder job error', {
        petId,
        error: error.message,
      })
    }
  }
}
