// steps/javascript/deletion-reaper.cron.step.js
const { findDeletedPetsReadyToPurge, remove } = require('./js-store');

exports.config = {
  type: 'cron',
  name: 'JsDeletionReaper',
  description: 'Daily job that permanently removes pets scheduled for deletion',
  cron: '0 2 * * *', // Daily at 2:00 AM
  emits: [],
  flows: ['JsPetManagement']
};

exports.handler = async ({ emit, logger }) => {
  if (logger) {
    logger.info('🔄 Deletion Reaper started - scanning for pets to purge');
  }

  try {
    const petsToReap = findDeletedPetsReadyToPurge();
    
    if (petsToReap.length === 0) {
      if (logger) {
        logger.info('✅ Deletion Reaper completed - no pets to purge');
      }
      
      if (emit) {
        await emit({
          topic: 'js.reaper.completed',
          data: { 
            scannedAt: Date.now(),
            purgedCount: 0,
            message: 'No pets ready for purging'
          }
        });
      }
      return;
    }

    let purgedCount = 0;
    
    for (const pet of petsToReap) {
      const success = remove(pet.id);
      
      if (success) {
        purgedCount++;
        
        if (logger) {
          logger.info('💀 Pet permanently purged', { 
            petId: pet.id, 
            name: pet.name,
            deletedAt: new Date(pet.deletedAt).toISOString(),
            purgeAt: new Date(pet.purgeAt).toISOString()
          });
        }

        if (emit) {
          await emit({
            topic: 'js.pet.purged',
            data: { 
              petId: pet.id, 
              name: pet.name,
              species: pet.species,
              deletedAt: pet.deletedAt,
              purgedAt: Date.now()
            }
          });
        }
      } else {
        if (logger) {
          logger.warn('⚠️ Failed to purge pet', { petId: pet.id, name: pet.name });
        }
      }
    }

    if (logger) {
      logger.info('✅ Deletion Reaper completed', { 
        totalScanned: petsToReap.length,
        purgedCount,
        failedCount: petsToReap.length - purgedCount
      });
    }

    if (emit) {
      await emit({
        topic: 'js.reaper.completed',
        data: { 
          scannedAt: Date.now(),
          purgedCount,
          totalScanned: petsToReap.length
        }
      });
    }

  } catch (error) {
    if (logger) {
      logger.error('❌ Deletion Reaper error', { error: error.message });
    }
  }
};
