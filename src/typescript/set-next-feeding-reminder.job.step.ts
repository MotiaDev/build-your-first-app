// steps/typescript/set-next-feeding-reminder.job.step.ts
import { EventConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsSetNextFeedingReminder',
  description: 'Background job that sets next feeding reminder and adds welcome notes',
  subscribes: ['ts.feeding.reminder.enqueued'],
  emits: ['ts.feeding.reminder.completed'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsSetNextFeedingReminder'] = async (input, { emit, logger, streams, traceId }) => {
  const { petId, enqueuedAt } = input;

  if (logger) {
    logger.info('🔄 Setting next feeding reminder', { petId, enqueuedAt });
  }

  try {
    // Calculate next feeding time (24 hours from now)
    const nextFeedingAt = Date.now() + (24 * 60 * 60 * 1000);
    
    // Fill in non-critical details and change status to in_quarantine
    const updates = {
      notes: 'Welcome to our pet store! We\'ll take great care of this pet.',
      nextFeedingAt: nextFeedingAt,
      status: 'in_quarantine' as const
    };

    const updatedPet = TSStore.update(petId, updates);
    
    if (!updatedPet) {
      if (logger) {
        logger.error('❌ Failed to set feeding reminder - pet not found', { petId });
      }
      return;
    }

    if (logger) {
      logger.info('✅ Next feeding reminder set', { 
        petId, 
        notes: updatedPet.notes?.substring(0, 50) + '...',
        nextFeedingAt: new Date(nextFeedingAt).toISOString()
      });
    }

    // Stream status updates using the simple pattern
    if (streams?.petCreation && traceId) {
      await streams.petCreation.set(traceId, 'message', { 
        message: `Pet ${updatedPet.name} entered quarantine period` 
      });

      // Check symptoms and stream appropriate updates
      if (!updatedPet.symptoms || updatedPet.symptoms.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await streams.petCreation.set(traceId, 'message', { 
          message: `Health check passed for ${updatedPet.name} - no symptoms found` 
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await streams.petCreation.set(traceId, 'message', { 
          message: `${updatedPet.name} is healthy and ready for adoption! ✅` 
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await streams.petCreation.set(traceId, 'message', { 
          message: `Health check failed for ${updatedPet.name} - symptoms detected: ${updatedPet.symptoms.join(', ')}` 
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await streams.petCreation.set(traceId, 'message', { 
          message: `${updatedPet.name} needs medical treatment ❌` 
        });
      }
    }

    if (emit) {
      (emit as any)({
        topic: 'ts.feeding.reminder.completed',
        data: { 
          petId, 
          event: 'feeding.reminder.completed',
          completedAt: Date.now(),
          processingTimeMs: Date.now() - enqueuedAt
        }
      });
    }

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Feeding reminder job error', { petId, error: error.message });
    }
  }
};
