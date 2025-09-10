// steps/javascript/adoption.check.step.js
exports.config = {
  type: 'event',
  name: 'JsAdoptionCheck',
  subscribes: ['js.adoption.applied'],
  emits: ['js.adoption.checked'],
  flows: ['pets']
};

exports.handler = async (event, context) => {
  const logger = context?.logger;
  const emit = context?.emit;
  
  const { applicationId, petId, petName, adopterName, adopterEmail } = event.data || event;
  
  if (!applicationId) {
    console.log('❌ No application ID provided in adoption.applied event');
    return { success: false, message: 'Missing application ID' };
  }
  
  // Simulate background check process
  console.log(`🔍 Running background check for ${adopterName}...`);
  
  // Simulate async background check (e.g., credit check, references, etc.)
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simple check logic (in real world, this would be more complex)
  const checkPassed = !adopterEmail.includes('spam') && adopterName.length > 2;
  const checkResult = checkPassed ? 'passed' : 'failed';
  const checkReason = checkPassed ? 'All checks passed' : 'Failed basic validation';
  
  const checkData = {
    applicationId,
    petId,
    petName,
    adopterName,
    adopterEmail,
    checkResult,
    checkReason,
    checkedAt: Date.now()
  };
  
  // Log the check result
  if (logger) {
    logger.info('Background check completed', checkData);
  }
  
  console.log(`✅ Background check ${checkResult} for ${adopterName}`);
  
  // Emit event to trigger decision
  if (emit) {
    await emit({
      topic: 'js.adoption.checked',
      data: checkData
    });
  }
  
  return {
    success: true,
    message: `Background check ${checkResult}`,
    checkResult,
    applicationId
  };
};