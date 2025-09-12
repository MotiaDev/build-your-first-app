// steps/typescript/adoption.followup.event.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionFollowup',
  subscribes: ['ts.adoption.approved'],
  emits: [],
  flows: ['adoptions']
};

export const handler = async (event: any, context?: any) => {
  const logger = context?.logger;

  // Try both event.data and direct event access
  const eventData = event.data || event;
  const { petId, applicationId } = eventData;

  if (!petId) {
    console.log('❌ No pet ID provided in adoption event');
    return { success: false, message: 'Missing pet ID' };
  }

  const pet = TSStore.get(petId);
  if (!pet) {
    console.log(`❌ Pet with ID ${petId} not found`);
    return { success: false, message: 'Pet not found' };
  }

  // Log to both console and structured logger
  console.log(`📧 Sending adoption follow-up for ${pet.name}`);
  if (logger) {
    logger.info('Adoption follow-up sent', {
      petId,
      petName: pet.name,
      applicationId,
      species: pet.species
    });
  }

  // Simulate sending follow-up email/notification
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    success: true,
    message: `Follow-up sent for ${pet.name}'s adoption`,
    petName: pet.name,
    applicationId
  };
};
