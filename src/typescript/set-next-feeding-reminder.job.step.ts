// src/typescript/set-next-feeding-reminder.job.step.ts
import { EventConfig, Handlers } from 'motia'
import { TSStore } from './ts-store'

export const config = {
  type: 'event',
  name: 'TsSetNextFeedingReminder',
  description:
    'Background job that sets next feeding reminder and adds welcome notes',
  subscribes: ['ts.feeding.reminder.enqueued'],
  emits: [],
  flows: ['TsPetManagement'],
}

export const handler: Handlers['TsSetNextFeedingReminder'] = async (
  input,
  { emit, logger }
) => {
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

    const updatedPet = TSStore.update(petId, updates)

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

    // Feeding reminder scheduled successfully
  } catch (error: any) {
    if (logger) {
      logger.error('❌ Feeding reminder job error', {
        petId,
        error: error.message,
      })
    }
  }
}
