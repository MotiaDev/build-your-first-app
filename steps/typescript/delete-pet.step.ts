// steps/typescript/delete-pet.step.ts
// import { ApiRouteConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'api',
  name: 'TsDeletePet',
  path: '/ts/pets/:id',
  method: 'DELETE',
  emits: ['ts.pet.soft.deleted'],
  flows: ['TsPetManagement']
};

export const handler = async (req: any, context?: any) => {
  const { emit, logger } = context || {};
  const petId = req.pathParams.id;
  
  const deletedPet = TSStore.softDelete(petId);
  
  if (!deletedPet) {
    return { status: 404, body: { message: 'Not found' } };
  }

  if (logger) {
    logger.info('🗑️ Pet soft deleted', { 
      petId: deletedPet.id, 
      name: deletedPet.name, 
      purgeAt: new Date(deletedPet.purgeAt!).toISOString()
    });
  }

  if (emit) {
    await emit({
      topic: 'ts.pet.soft.deleted',
      data: { 
        petId: deletedPet.id, 
        name: deletedPet.name, 
        purgeAt: deletedPet.purgeAt 
      }
    });
  }

  return { 
    status: 202, 
    body: { 
      message: 'Pet scheduled for deletion',
      petId: deletedPet.id,
      purgeAt: deletedPet.purgeAt
    } 
  };
};
