// steps/typescript/postcreate-lite.job.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsPetEnrichment',
  description: 'Background job that enriches pet records with default notes and feeding schedule',
  subscribes: ['ts.pet.enrichment.enqueued'],
  emits: [],
  flows: ['pets']
};

export const handler = async (input: any, context?: any) => {
  const { emit, logger } = context || {};
  const { petId, enqueuedAt } = input;

  if (logger) {
    logger.info('🔄 Pet enrichment job started', { petId, enqueuedAt });
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
        logger.error('❌ Pet enrichment job failed - pet not found', { petId });
      }
      return;
    }

    if (logger) {
      logger.info('✅ Pet enrichment job completed', { 
        petId, 
        notes: updatedPet.notes?.substring(0, 50) + '...',
        nextFeedingAt: new Date(nextFeedingAt).toISOString()
      });
    }

    // Pet enrichment completed successfully

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Pet enrichment job error', { petId, error: error.message });
    }
  }
};
