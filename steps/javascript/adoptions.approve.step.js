// steps/javascript/adoptions.approve.step.js
const { get, update } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsAdoptionApply',
  path: '/js/adoptions/apply',
  method: 'POST',
  emits: ['js.adoption.applied'],
  flows: ['pets']
};

exports.handler = async (req) => {
  const { petId, adopterName, adopterEmail } = req.body || {};
  
  // Validate required fields
  if (!petId || !adopterName || !adopterEmail) {
    return { 
      status: 400, 
      body: { message: 'Missing required fields: petId, adopterName, adopterEmail' } 
    };
  }
  
  // Check if pet exists
  const pet = get(petId);
  if (!pet) {
    return { status: 404, body: { message: 'Pet not found' } };
  }
  
  // Check if pet is available
  if (pet.status !== 'available') {
    return { 
      status: 400, 
      body: { message: `Pet is not available (current status: ${pet.status})` } 
    };
  }
  
  // Generate application ID
  const applicationId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  // Update pet status to pending
  update(petId, { status: 'pending' });
  
  console.log(`📝 Application submitted for ${pet.name} by ${adopterName}`);
  
  return {
    status: 201,
    body: {
      message: `Application submitted for ${pet.name}`,
      applicationId,
      status: 'pending_check'
    },
    events: [{
      type: 'js.adoption.applied',
      data: { applicationId, petId, petName: pet.name, adopterName, adopterEmail }
    }]
  };
};