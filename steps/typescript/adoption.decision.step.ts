// steps/typescript/adoption.decision.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionDecision',
  subscribes: ['ts.adoption.checked'],
  emits: ['ts.adoption.approved', 'ts.adoption.rejected'],
  flows: ['pets']
};

export const handler = async (event: any, context?: any) => {
  const logger = context?.logger;
  const emit = context?.emit;
  
  const { applicationId, petId, petName, adopterName, checkResult, checkReason } = event.data || event;
  
  if (!applicationId) {
    console.log('❌ No application ID provided in adoption.checked event');
    return { success: false, message: 'Missing application ID' };
  }
  
  // Make decision based on background check
  const approved = checkResult === 'passed';
  const decision = approved ? 'approved' : 'rejected';
  const decisionReason = approved ? 'Background check passed' : `Background check failed: ${checkReason}`;
  
  console.log(`⚖️ Making adoption decision for ${adopterName}: ${decision.toUpperCase()}`);
  
  // Update pet status based on decision
  if (approved) {
    TSStore.update(petId, { status: 'adopted' });
  } else {
    TSStore.update(petId, { status: 'available' }); // Make available again
  }
  
  const decisionData = {
    applicationId,
    petId,
    petName,
    adopterName,
    decision,
    decisionReason,
    decidedAt: Date.now()
  };
  
  // Log the decision
  if (logger) {
    logger.info(`Adoption ${decision}`, decisionData);
  }
  
  console.log(`${approved ? '🎉' : '❌'} Adoption ${decision} for ${petName} → ${adopterName}`);
  
  // Emit appropriate event based on decision
  if (emit) {
    const eventTopic = approved ? 'ts.adoption.approved' : 'ts.adoption.rejected';
    await emit({
      topic: eventTopic,
      data: decisionData
    });
  }
  
  return {
    success: true,
    message: `Adoption ${decision}`,
    decision,
    applicationId,
    petId
  };
};