import { CronConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: CronConfig = {
  type: 'cron',
  name: 'TsAdoptionCheckinDay3',
  description: 'Runs 3 days after approval to check in on new adoptions',
  cron: '0 10 * * *', // Daily at 10 AM - in production would be more specific
  emits: ['ts.adoption.checkin.day3'],
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsAdoptionCheckinDay3'] = async ({ emit, logger, streams, traceId }) => {
  logger.info('🗓️ Running 3-day adoption check-in job');

  try {
    // In a real system, this would query a database for adoptions from 3 days ago
    // For this demo, we'll simulate by checking recent adoptions
    const allPets = TSStore.list();
    const adoptedPets = allPets.filter(pet => pet.status === 'adopted');

    logger.info('Found adopted pets for potential check-in', { 
      adoptedCount: adoptedPets.length 
    });

    // Simulate checking adoptions from 3 days ago
    // In production, you'd have adoption records with timestamps
    for (const pet of adoptedPets.slice(0, 2)) { // Limit to first 2 for demo
      const checkinData = {
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        checkinType: 'day3',
        checkinDate: new Date().toISOString(),
        message: `3-day check-in for ${pet.name} - How is your new ${pet.species} settling in?`,
        recommendations: [
          'Ensure consistent feeding schedule',
          'Monitor stress levels and behavior',
          'Schedule vet check-up if not done already',
          'Contact us with any concerns'
        ]
      };

      logger.info('Sending 3-day check-in', { 
        petId: pet.id, 
        petName: pet.name 
      });

      // Create a new trace for this cron-initiated flow
      const checkinTraceId = `checkin-day3-${pet.id}-${Date.now()}`;

      // Update adoptions stream with follow-up
      if (streams?.adoptions) {
        await streams.adoptions.set(checkinTraceId, 'followup', {
          entityId: `checkin-${pet.id}`,
          type: 'followup',
          phase: 'followup',
          message: checkinData.message,
          timestamp: Date.now(),
          data: checkinData
        });
      }

      // Emit check-in event
      await emit({
        topic: 'ts.adoption.checkin.day3',
        data: {
          ...checkinData,
          traceId: checkinTraceId
        }
      });

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('3-day check-in job completed', { 
      processedCount: Math.min(adoptedPets.length, 2) 
    });

  } catch (error) {
    logger.error('3-day check-in job failed', { error: error.message });
  }
};
