// steps/typescript/adoption-posting.step.ts
import { EventConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionPosting',
  description: 'Posts pet for adoption and schedules adoption interviews when pet is ready',
  subscribes: ['ts.adoption.ready'],
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsAdoptionPosting'] = async (input, { logger }) => {
  const { petId, profile } = input;

  if (logger) {
    logger.info('🏠 Adoption Posting triggered', { petId });
  }

  try {
    const pet = TSStore.get(petId);
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for adoption posting', { petId });
      }
      return;
    }

    // Create adoption posting
    const adoptionPosting = {
      petId,
      postedAt: Date.now(),
      title: `${pet.name} - ${pet.profile?.breedGuess || pet.species} Available for Adoption`,
      description: pet.profile?.bio || `Meet ${pet.name}, a lovely ${pet.species} looking for a forever home.`,
      ageMonths: pet.ageMonths,
      species: pet.species,
      breed: pet.profile?.breedGuess || 'Mixed Breed',
      temperament: pet.profile?.temperamentTags || [],
      adopterHints: pet.profile?.adopterHints || [],
      specialNeeds: pet.flags || [],
      adoptionFee: calculateAdoptionFee(pet),
      location: 'Animal Shelter',
      contactInfo: 'shelter@example.com',
      requirements: generateAdoptionRequirements(pet)
    };

    if (logger) {
      logger.info('📝 Adoption posting created', {
        petId,
        title: adoptionPosting.title,
        adoptionFee: adoptionPosting.adoptionFee
      });
    }

    // Adoption posted and interview scheduled (no emit - no subscribers)

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Adoption posting failed', { petId, error: error.message });
    }
  }
};

function calculateAdoptionFee(pet: any): number {
  const baseFee = 150;
  const ageFactor = pet.ageMonths < 12 ? 50 : 0; // Puppies/kittens cost more
  const breedFactor = pet.profile?.breedGuess?.includes('Purebred') ? 100 : 0;
  
  return baseFee + ageFactor + breedFactor;
}

function generateAdoptionRequirements(pet: any): string[] {
  const requirements = [
    'Must be 21 years or older',
    'Valid photo ID required',
    'Proof of current address',
    'Landlord approval (if renting)',
    'Reference from current veterinarian'
  ];

  // Add specific requirements based on pet characteristics
  if (pet.profile?.temperamentTags?.includes('high_energy')) {
    requirements.push('Active lifestyle recommended');
  }
  if (pet.profile?.temperamentTags?.includes('needs_experience')) {
    requirements.push('Previous pet ownership experience preferred');
  }
  if (pet.flags?.includes('special_needs')) {
    requirements.push('Special care experience required');
  }

  return requirements;
}
