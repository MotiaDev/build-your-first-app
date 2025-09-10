// steps/javascript/adoption.decision.step.js
const { update } = require('./js-store');

exports.config = {
  type: 'event',
  name: 'JsAdoptionDecision',
  subscribes: ['js.adoption.checked'],
  emits: ['js.adoption.approved', 'js.adoption.rejected'],
  flows: ['pets']
};

exports.handler = async (event, context) => {
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
    update(petId, { status: 'adopted' });
  } else {
    update(petId, { status: 'available' }); // Make available again
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
    const eventTopic = approved ? 'js.adoption.approved' : 'js.adoption.rejected';
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