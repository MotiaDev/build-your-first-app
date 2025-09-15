import { CronConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: CronConfig = {
  type: 'cron',
  name: 'TsAdoptionCheckinDay14',
  description: 'Runs 14 days after approval to check in on established adoptions',
  cron: '0 14 * * *', // Daily at 2 PM - in production would be more specific
  emits: ['ts.adoption.checkin.day14'],
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsAdoptionCheckinDay14'] = async ({ emit, logger, streams, traceId }) => {
  logger.info('🗓️ Running 14-day adoption check-in job');

  try {
    // In a real system, this would query a database for adoptions from 14 days ago
    // For this demo, we'll simulate by checking recent adoptions
    const allPets = TSStore.list();
    const adoptedPets = allPets.filter(pet => pet.status === 'adopted');

    logger.info('Found adopted pets for 14-day check-in', { 
      adoptedCount: adoptedPets.length 
    });

    // Simulate checking adoptions from 14 days ago
    for (const pet of adoptedPets.slice(0, 1)) { // Limit to first 1 for demo
      const checkinData = {
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        checkinType: 'day14',
        checkinDate: new Date().toISOString(),
        message: `2-week check-in for ${pet.name} - How has your ${pet.species} been adjusting to their new home?`,
        recommendations: [
          'Share photos and updates with us',
          'Consider training classes if needed',
          'Schedule regular vet visits',
          'Connect with other pet parents in our community',
          'Rate your adoption experience'
        ],
        milestones: [
          'Pet should be fully settled in routine',
          'Bonding with family members established',
          'Any initial behavioral issues resolved',
          'Feeding and exercise patterns established'
        ]
      };

      logger.info('Sending 14-day check-in', { 
        petId: pet.id, 
        petName: pet.name 
      });

      // Create a new trace for this cron-initiated flow
      const checkinTraceId = `checkin-day14-${pet.id}-${Date.now()}`;

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
        topic: 'ts.adoption.checkin.day14',
        data: {
          ...checkinData,
          traceId: checkinTraceId
        }
      });

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('14-day check-in job completed', { 
      processedCount: Math.min(adoptedPets.length, 1) 
    });

  } catch (error) {
    logger.error('14-day check-in job failed', { error: error.message });
  }
};
