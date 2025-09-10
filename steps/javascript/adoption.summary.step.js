// steps/javascript/adoption.summary.step.js
const { PetRecommendationAgent } = require('./agent');

exports.config = {
  type: 'event',
  name: 'JsAdoptionSummary',
  subscribes: ['js.adoption.checked'],
  emits: ['js.adoption.summary.generated'],
  flows: ['pets']
};

exports.handler = async (event, context) => {
  const logger = context?.logger;
  const emit = context?.emit;
  
  const { applicationId, petName, adopterName, checkResult, checkReason } = event.data || event;
  
  if (!applicationId) {
    console.log('❌ No application ID provided in adoption.checked event');
    return { success: false, message: 'Missing application ID' };
  }
  
  console.log(`📝 Generating application summary for ${adopterName} → ${petName}`);
  
  try {
    // Generate intelligent summary using the agent
    const summary = await PetRecommendationAgent.generateApplicationSummary({
      petName,
      adopterName,
      checkResult,
      checkReason,
      applicationId
    });
    
    const summaryData = {
      applicationId,
      petName,
      adopterName,
      checkResult,
      summary,
      generatedAt: Date.now()
    };
    
    // Log the generated summary
    if (logger) {
      logger.info('Application summary generated', summaryData);
    }
    
    console.log(`✨ Summary: "${summary}"`);
    
    // Emit summary generated event
    if (emit) {
      await emit({
        topic: 'js.adoption.summary.generated',
        data: summaryData
      });
    }
    
    return {
      success: true,
      message: 'Application summary generated',
      summary,
      applicationId
    };
    
  } catch (error) {
    console.log(`❌ Failed to generate summary: ${error.message}`);
    if (logger) {
      logger.error('Summary generation failed', { error: error.message, applicationId });
    }
    
    return {
      success: false,
      message: 'Failed to generate summary',
      applicationId
    };
  }
};