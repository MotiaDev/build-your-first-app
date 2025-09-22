// steps/typescript/postcreate-lite.job.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsPostCreateLite',
  description: 'Background job that fills in non-critical details after pet creation',
  subscribes: ['ts.job.postcreate.enqueued'],
  emits: ['ts.job.postcreate.completed'],
  flows: ['pets']
};

export const handler = async (input: any, context?: any) => {
  const { emit, logger } = context || {};
  const { petId, enqueuedAt } = input;

  if (logger) {
    logger.info('🔄 PostCreateLite job started', { petId, enqueuedAt });
  }

  try {
    // Calculate next feeding time (24 hours from now)
    const nextFeedingAt = Date.now() + (24 * 60 * 60 * 1000);
    
    // Fill in non-critical details
    const updates = {
      notes: 'Welcome to our pet store! We\'ll take great care of this pet.',
      nextFeedingAt: nextFeedingAt
    };

    const updatedPet = TSStore.update(petId, updates);
    
    if (!updatedPet) {
      if (logger) {
        logger.error('❌ PostCreateLite job failed - pet not found', { petId });
      }
      return;
    }

    if (logger) {
      logger.info('✅ PostCreateLite job completed', { 
        petId, 
        notes: updatedPet.notes?.substring(0, 50) + '...',
        nextFeedingAt: new Date(nextFeedingAt).toISOString()
      });
    }

    if (emit) {
      await emit({
        topic: 'ts.job.postcreate.completed',
        data: { 
          petId, 
          completedAt: Date.now(),
          processingTimeMs: Date.now() - enqueuedAt
        }
      });
    }

  } catch (error: any) {
    if (logger) {
      logger.error('❌ PostCreateLite job error', { petId, error: error.message });
    }
  }
};
