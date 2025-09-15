// steps/javascript/adoption.decision.step.js
const { get, update } = require('./js-store');

exports.config = {
  type: 'event',
  name: 'JsWorkflowDecision',
  description: 'Workflow gateway that decides to approve, reject, or escalate based on background check and summary',
  subscribes: ['js.adoption.background.complete', 'js.adoption.summary.complete'],
  emits: ['js.adoption.approved', 'js.adoption.rejected', 'js.adoption.escalate'],
  flows: ['javascript-adoptions'],
};

// Track completion of parallel processes per application
const applicationState = new Map();

exports.handler = async (event, { emit, logger, streams, traceId }) => {
  const { applicationId, petId, adopterName, adopterEmail } = event || {};

  logger.info('⚖️ Processing workflow decision input', { applicationId, petId });

  try {
    // Determine which process completed based on event data
    const isBackgroundComplete = event.checkResult !== undefined;
    const isSummaryComplete = event.summary !== undefined;

    // Get or create application state
    let appState = applicationState.get(applicationId) || {};

    // Update state based on completed process
    if (isBackgroundComplete) {
      appState.backgroundComplete = {
        checkResult: event.checkResult,
        checkDetails: event.checkDetails,
        completedAt: new Date().toISOString()
      };
      logger.info('Background check completed for application', { applicationId });
    }

    if (isSummaryComplete) {
      appState.summaryComplete = {
        summary: event.summary,
        completedAt: new Date().toISOString()
      };
      logger.info('Summary generation completed for application', { applicationId });
    }

    // Save updated state
    applicationState.set(applicationId, appState);

    // Check if both processes are complete
    if (!appState.backgroundComplete || !appState.summaryComplete) {
      logger.info('Waiting for parallel processes to complete', { 
        applicationId,
        backgroundComplete: !!appState.backgroundComplete,
        summaryComplete: !!appState.summaryComplete
      });
      return; // Wait for the other process
    }

    // Both processes complete - make decision
    logger.info('🎯 Making workflow decision - both processes complete', { applicationId, petId });

    const checkResult = appState.backgroundComplete.checkResult;
    const checkDetails = appState.backgroundComplete.checkDetails;
    const summary = appState.summaryComplete.summary;

    // Decision logic
    let decision = 'approve';
    let reason = 'Application meets all criteria';

    // Check for automatic rejection
    if (checkResult === 'failed') {
      decision = 'reject';
      reason = `Background check failed: ${checkDetails}`;
    } else if (checkResult === 'error') {
      decision = 'escalate';
      reason = 'Background check encountered errors, requires review';
    }

    // Check for escalation conditions
    if (decision === 'approve') {
      // Check for escalation triggers in summary
      if (summary && (
        summary.toLowerCase().includes('concern') ||
        summary.toLowerCase().includes('risk') ||
        summary.toLowerCase().includes('issue')
      )) {
        decision = 'escalate';
        reason = 'Summary indicates potential concerns requiring review';
      }

      // Check pet characteristics that might require escalation
      const pet = get(petId);
      if (pet) {
        const petAge = Math.floor(pet.ageMonths / 12);
        if (petAge > 10) {
          decision = 'escalate';
          reason = 'Senior pet adoption requires additional assessment';
        }
        if (pet.species === 'bird' || pet.species === 'exotic') {
          decision = 'escalate';
          reason = 'Exotic pet adoption requires specialized assessment';
        }
      }
    }

    // Random escalation for demonstration (10% chance)
    if (decision === 'approve' && Math.random() < 0.1) {
      decision = 'escalate';
      reason = 'Random quality assurance review';
    }

    logger.info('Workflow decision made', { 
      applicationId, 
      petId, 
      decision, 
      reason,
      checkResult,
      summaryLength: summary?.length || 0
    });

    // Execute decision
    if (decision === 'approve') {
      // Mark pet as adopted
      const pet = get(petId);
      if (pet) {
        update(petId, { status: 'adopted' });
      }

      // Update stream
      if (streams?.adoptions && traceId) {
        await streams.adoptions.set(traceId, 'decision', {
          entityId: applicationId,
          type: 'decision',
          phase: 'approved',
          message: `Application approved: ${reason}`,
          timestamp: Date.now(),
          data: { petId, adopterName, decision, reason }
        });

        await streams.adoptions.set(traceId, 'pet_status', {
          entityId: petId,
          type: 'pet',
          phase: 'adopted',
          message: 'Pet successfully adopted',
          timestamp: Date.now(),
          data: { petName: pet?.name }
        });
      }

      // Emit approval
      await emit({
        topic: 'js.adoption.approved',
        data: {
          applicationId,
          petId,
          adopterName,
          adopterEmail,
          reason,
          checkResult,
          summary,
          traceId
        }
      });

    } else if (decision === 'reject') {
      // Update stream
      if (streams?.adoptions && traceId) {
        await streams.adoptions.set(traceId, 'decision', {
          entityId: applicationId,
          type: 'decision',
          phase: 'rejected',
          message: `Application rejected: ${reason}`,
          timestamp: Date.now(),
          data: { petId, adopterName, decision, reason }
        });
      }

      // Emit rejection
      await emit({
        topic: 'js.adoption.rejected',
        data: {
          applicationId,
          petId,
          adopterName,
          adopterEmail,
          rejectionReason: reason,
          checkResult,
          checkDetails,
          summary,
          traceId
        }
      });

    } else if (decision === 'escalate') {
      // Update stream
      if (streams?.adoptions && traceId) {
        await streams.adoptions.set(traceId, 'decision', {
          entityId: applicationId,
          type: 'decision',
          phase: 'escalated',
          message: `Application escalated: ${reason}`,
          timestamp: Date.now(),
          data: { petId, adopterName, decision, reason }
        });
      }

      // Emit escalation for risk assessment
      await emit({
        topic: 'js.adoption.escalate',
        data: {
          applicationId,
          petId,
          adopterName,
          adopterEmail,
          escalationReason: reason,
          checkResult,
          checkDetails,
          summary,
          traceId
        }
      });
    }

    // Clean up application state
    applicationState.delete(applicationId);

  } catch (error) {
    logger.error('Workflow decision failed', { 
      applicationId, 
      petId, 
      error: error.message 
    });

    // Default to escalation on error
    await emit({
      topic: 'js.adoption.escalate',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        escalationReason: `Decision process error: ${error.message}`,
        error: error.message,
        traceId
      }
    });

    // Clean up
    applicationState.delete(applicationId);
  }
};