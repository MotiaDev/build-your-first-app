// steps/typescript/adoption-posting.step.ts
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionPosting',
  description: 'Posts pet for adoption and schedules adoption interviews when pet is ready',
  subscribes: ['ts.adoption.ready'],
  emits: ['ts.adoption.posted', 'ts.interview.scheduled'],
  flows: ['TsPetManagement']
};

export const handler = async (input: any, context?: any) => {
  const { emit, logger } = context || {};
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

    // Emit adoption posted event
    if (emit) {
      await emit({
        topic: 'ts.adoption.posted',
        data: {
          petId,
          adoptionPosting,
          nextSteps: [
            'Share on social media',
            'Update shelter website',
            'Notify adoption coordinators',
            'Prepare adoption paperwork'
          ],
          timestamp: Date.now()
        }
      });

      // Schedule initial adoption interview
      await emit({
        topic: 'ts.interview.scheduled',
        data: {
          petId,
          interviewType: 'adoption_screening',
          scheduledAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 1 week from now
          duration: '30 minutes',
          requirements: [
            'Valid ID',
            'Proof of residence',
            'References from veterinarian',
            'Home visit scheduled'
          ],
          notes: `Initial screening for ${pet.name} adoption`
        }
      });
    }

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
