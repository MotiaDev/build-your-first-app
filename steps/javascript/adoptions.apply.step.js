// steps/javascript/adoptions.apply.step.js
const { get } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsAdoptionApply',
  path: '/js/adoptions/apply',
  method: 'POST',
  emits: ['js.adoption.applied'],
  flows: ['javascript-adoptions']
};

exports.handler = async (req, { emit, logger, streams, traceId }) => {
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
  if (pet.status === 'adopted') return { status: 409, body: { message: 'Pet already adopted' } };

  const applicationId = `app-${Date.now()}`;
  
  logger.info('📋 Adoption application received', { 
    applicationId, 
    petId, 
    petName: pet.name,
    adopterName,
    adopterEmail 
  });

  // Create & return the initial stream record (grouped by traceId)
  const record = await streams.adoptions.set(traceId, 'status', {
    entityId: applicationId,
    type: 'application',
    phase: 'applied',
    message: `${adopterName} applied to adopt ${pet.name}`,
    timestamp: Date.now(),
    data: { 
      petId, 
      petName: pet.name, 
      petSpecies: pet.species,
      adopterName,
      adopterEmail 
    }
  });

  await emit({ 
    topic: 'js.adoption.applied', 
    data: { 
      applicationId, 
      petId, 
      adopterName,
      adopterEmail,
      traceId 
    } 
  });
  
  return { 
    status: 202, 
    body: record || { 
      entityId: applicationId, 
      type: 'application', 
      phase: 'applied',
      traceId 
    } 
  };
};
