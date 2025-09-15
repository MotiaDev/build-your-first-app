// steps/javascript/adoptions.apply.step.js
const { get } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsAdoptionApply',
  path: '/js/adoptions/apply',
  method: 'POST',
  emits: ['js.adoption.applied', 'js.adoption.rejected'],
  flows: ['javascript-adoptions']
};

exports.handler = async (req, { emit, logger }) => {
  const b = req.body || {};
  const petId = String(b.petId || '');
  const adopterName = String(b.adopterName || '');
  const adopterEmail = String(b.adopterEmail || '');
  
  // Validate required fields
  if (!petId) return { status: 400, body: { message: 'petId is required' } };
  if (!adopterName) return { status: 400, body: { message: 'adopterName is required' } };
  if (!adopterEmail) return { status: 400, body: { message: 'adopterEmail is required' } };
  
  const pet = get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };
  
  if (pet.status === 'adopted') {
    const applicationId = `app-${Date.now()}`;
    
    logger.info('🚫 Pet already adopted - triggering recommender', { 
      applicationId, 
      petId, 
      petName: pet.name,
      adopterName,
      adopterEmail 
    });

    // Trigger recommender for alternative pets
    await emit({
      topic: 'js.adoption.rejected',
      data: {
        applicationId,
        petId,
        adopterName,
        adopterEmail,
        rejectionReason: `${pet.name} has already been adopted`
      }
    });

    return { 
      status: 409, 
      body: { 
        message: `${pet.name} has already been adopted. We're finding alternative pets for you...`,
        applicationId,
        status: 'finding_alternatives'
      } 
    };
  }

  const applicationId = `app-${Date.now()}`;
  
  logger.info('📋 Adoption application received', { 
    applicationId, 
    petId, 
    petName: pet.name,
    adopterName,
    adopterEmail 
  });

  await emit({ 
    topic: 'js.adoption.applied', 
    data: { 
      applicationId, 
      petId, 
      adopterName,
      adopterEmail
    } 
  });
  
  return { 
    status: 202, 
    body: { 
      applicationId,
      message: `Application submitted for ${pet.name}`,
      status: 'processing'
    } 
  };
};
