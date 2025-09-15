import { CronConfig, Handlers } from 'motia';

export const config: CronConfig = {
  type: 'cron',
  name: 'TsStaleApplicationCleanup',
  description: 'Runs nightly to clean up old pending applications and update streams',
  cron: '0 2 * * *', // Daily at 2 AM
  emits: ['ts.adoption.cleanup.complete'],
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsStaleApplicationCleanup'] = async ({ emit, logger, streams, traceId }) => {
  logger.info('🧹 Running stale application cleanup job');

  try {
    // In a real system, this would query a database for old pending applications
    // For this demo, we'll simulate the cleanup process

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago

    const cleanupStats = {
      totalChecked: 0,
      expiredApplications: 0,
      cleanedStreams: 0,
      errors: 0
    };

    // Simulate finding and cleaning up stale applications
    // In production, this would be a database query
    const staleApplicationIds = [
      // These would come from a real database query
      // `app-${Date.now() - 7 * 24 * 60 * 60 * 1000}`, // 7 days old
    ];

    logger.info('Found potentially stale applications', { 
      count: staleApplicationIds.length,
      cutoffDate: cutoffDate.toISOString()
    });

    for (const applicationId of staleApplicationIds) {
      try {
        cleanupStats.totalChecked++;

        // In a real system, check if application is truly stale
        const isStale = true; // Simulate stale check

        if (isStale) {
          cleanupStats.expiredApplications++;

          // Create cleanup trace
          const cleanupTraceId = `cleanup-${applicationId}-${Date.now()}`;

          // Update stream to mark as closed
          if (streams?.adoptions) {
            await streams.adoptions.set(cleanupTraceId, 'cleanup', {
              entityId: applicationId,
              type: 'cleanup',
              phase: 'closed',
              message: 'Application expired due to inactivity',
              timestamp: Date.now(),
              data: {
                applicationId,
                reason: 'expired_stale',
                cleanupDate: new Date().toISOString(),
                daysSinceLastActivity: 7
              }
            });
            cleanupStats.cleanedStreams++;
          }

          logger.info('Cleaned up stale application', { 
            applicationId,
            daysSinceLastActivity: 7
          });
        }

      } catch (error) {
        cleanupStats.errors++;
        logger.warn('Failed to cleanup application', { 
          applicationId, 
          error: error.message 
        });
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Cleanup old stream entries (simulate)
    // In production, this might involve archiving or deleting old stream data
    const oldStreamEntriesCleanedUp = Math.floor(Math.random() * 10); // Simulate
    cleanupStats.cleanedStreams += oldStreamEntriesCleanedUp;

    // Create summary trace for the cleanup job
    const jobTraceId = `cleanup-job-${Date.now()}`;
    
    if (streams?.adoptions) {
      await streams.adoptions.set(jobTraceId, 'maintenance', {
        entityId: 'cleanup-job',
        type: 'maintenance',
        phase: 'cleanup_complete',
        message: `Cleanup completed: ${cleanupStats.expiredApplications} applications processed`,
        timestamp: Date.now(),
        data: cleanupStats
      });
    }

    logger.info('Stale application cleanup completed', cleanupStats);

    // Emit completion event
    await emit({
      topic: 'ts.adoption.cleanup.complete',
      data: {
        ...cleanupStats,
        completedAt: new Date().toISOString(),
        cutoffDate: cutoffDate.toISOString(),
        traceId: jobTraceId
      }
    });

  } catch (error) {
    logger.error('Stale application cleanup job failed', { error: error.message });

    // Emit error event
    await emit({
      topic: 'ts.adoption.cleanup.complete',
      data: {
        success: false,
        error: error.message,
        completedAt: new Date().toISOString(),
        traceId: `cleanup-error-${Date.now()}`
      }
    });
  }
};
