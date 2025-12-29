// steps/javascript/delete-pet.step.js
import { softDelete } from './js-store.js';

export const config = { type:'api', name:'JsDeletePet', path:'/js/pets/:id', method:'DELETE', emits: [], flows: ['JsPetManagement'] };
export const handler = async (req, context) => {
  const { emit, logger } = context || {};
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

  // Pet soft deleted successfully

  return { 
    status: 202, 
    body: { 
      message: 'Pet scheduled for deletion',
      petId: deletedPet.id,
      purgeAt: deletedPet.purgeAt
    } 
  };
};
