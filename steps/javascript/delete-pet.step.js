// steps/javascript/delete-pet.step.js
const { softDelete } = require('./js-store');

exports.config = { type:'api', name:'JsDeletePet', path:'/js/pets/:id', method:'DELETE', emits: [], flows: ['JsPetManagement'] };
exports.handler = async (req, context) => {
  const { logger } = context || {};
  const petId = req.pathParams.id;
  
  const deletedPet = softDelete(petId);
  
  if (!deletedPet) {
    return { status: 404, body: { message: 'Not found' } };
  }

  if (logger) {
    logger.info('🗑️ Pet soft deleted', { 
      petId: deletedPet.id, 
      name: deletedPet.name, 
      purgeAt: new Date(deletedPet.purgeAt).toISOString()
    });
  }

  // Pet soft deleted successfully (no emit - no subscribers)

  return { 
    status: 202, 
    body: { 
      message: 'Pet scheduled for deletion',
      petId: deletedPet.id,
      purgeAt: deletedPet.purgeAt
    } 
  };
};
