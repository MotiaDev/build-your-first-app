// steps/javascript/set-next-feeding-reminder.job.step.js
const { update } = require('./js-store');

exports.config = {
  type: 'event',
  name: 'JsSetNextFeedingReminder',
  description: 'Sets the next feeding reminder for a pet and updates its status',
  subscribes: ['js.feeding.reminder.enqueued'],
  emits: ['js.feeding.reminder.completed'],
  flows: ['JsPetManagement']
};

exports.handler = async (input, context) => {
  const { emit, logger, streams, traceId } = context || {};
  const { petId, enqueuedAt } = input;

  if (logger) {
    logger.info('🔄 Setting next feeding reminder', { petId, enqueuedAt });
  }

  try {
    // Calculate next feeding time (24 hours from now)
    const nextFeedingAt = Date.now() + (24 * 60 * 60 * 1000);
    
    // Fill in non-critical details
    const updates = {
      notes: 'Welcome to our pet store! We\'ll take great care of this pet.',
      nextFeedingAt: nextFeedingAt,
      status: 'in_quarantine' // Set status to in_quarantine here
    };

    const updatedPet = update(petId, updates);
    
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
      await emit({
        topic: 'js.feeding.reminder.completed',
        data: { 
          petId, 
          event: 'feeding.reminder.completed',
          completedAt: Date.now(),
          processingTimeMs: Date.now() - enqueuedAt
        }
      });
    }

  } catch (error) {
    if (logger) {
      logger.error('❌ Feeding reminder job error', { petId, error: error.message });
    }
  }
};
