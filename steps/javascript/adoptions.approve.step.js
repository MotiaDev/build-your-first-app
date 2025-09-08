// steps/javascript/adoptions.approve.step.js
const { get, update } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsApproveAdoption',
  path: '/js/pets/:id/adopt',
  method: 'POST',
  emits: ['adoption.approved']
};

exports.handler = async (req) => {
  const petId = req.pathParams?.id;
  const { adopterName } = req.body || {};
  
  if (!petId) {
    return { status: 400, body: { message: 'Pet ID is required' } };
  }
  
  if (!adopterName || typeof adopterName !== 'string') {
    return { status: 400, body: { message: 'Adopter name is required' } };
  }
  
  const pet = get(petId);
  if (!pet) {
    return { status: 404, body: { message: 'Pet not found' } };
  }
  
  if (pet.status === 'adopted') {
    return { status: 400, body: { message: 'Pet is already adopted' } };
  }
  
  // Update pet status to adopted
  const updatedPet = update(petId, { status: 'adopted' });
  
  if (!updatedPet) {
    return { status: 500, body: { message: 'Failed to update pet status' } };
  }
  
  console.log(`🎉 ${pet.name} has been adopted by ${adopterName}!`);
  
  return {
    status: 200,
    body: {
      message: `${pet.name} has been successfully adopted!`,
      pet: updatedPet,
      adopterName
    },
    events: [{
      type: 'adoption.approved',
      data: { petId, adopterName, petName: pet.name }
    }]
  };
};