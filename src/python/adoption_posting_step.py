# steps/python/adoption_posting.step.py
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

config = {
    "type": "event",
    "name": "PyAdoptionPosting",
    "description": "Posts pet for adoption and schedules adoption interviews when pet is ready",
    "subscribes": ["py.adoption.ready"],
    "emits": [],
    "flows": ["PyPetManagement"]
}

def calculate_adoption_fee(pet):
    base_fee = 150
    age_factor = 50 if pet['ageMonths'] < 12 else 0  # Puppies/kittens cost more
    breed_factor = 100 if pet.get('profile', {}).get('breedGuess', '').find('Purebred') != -1 else 0
    
    return base_fee + age_factor + breed_factor

def generate_adoption_requirements(pet):
    requirements = [
        'Must be 21 years or older',
        'Valid photo ID required',
        'Proof of current address',
        'Landlord approval (if renting)',
        'Reference from current veterinarian'
    ]

    # Add specific requirements based on pet characteristics
    profile = pet.get('profile', {})
    temperament_tags = profile.get('temperamentTags', [])
    flags = pet.get('flags', [])
    
    if 'high_energy' in temperament_tags:
        requirements.append('Active lifestyle recommended')
    if 'needs_experience' in temperament_tags:
        requirements.append('Previous pet ownership experience preferred')
    if 'special_needs' in flags:
        requirements.append('Special care experience required')

    return requirements

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    pet_id = input_data.get('petId')
    profile = input_data.get('profile', {})

    if logger:
        logger.info('🏠 Adoption Posting triggered', {'petId': pet_id})

    try:
        pet = pet_store.get(pet_id)
        if not pet:
            if logger:
                logger.error('❌ Pet not found for adoption posting', {'petId': pet_id})
            return

        # Create adoption posting
        adoption_posting = {
            'petId': pet_id,
            'postedAt': int(time.time() * 1000),
            'title': f"{pet['name']} - {pet.get('profile', {}).get('breedGuess', pet['species'])} Available for Adoption",
            'description': pet.get('profile', {}).get('bio', f"Meet {pet['name']}, a lovely {pet['species']} looking for a forever home."),
            'ageMonths': pet['ageMonths'],
            'species': pet['species'],
            'breed': pet.get('profile', {}).get('breedGuess', 'Mixed Breed'),
            'temperament': pet.get('profile', {}).get('temperamentTags', []),
            'adopterHints': pet.get('profile', {}).get('adopterHints', []),
            'specialNeeds': pet.get('flags', []),
            'adoptionFee': calculate_adoption_fee(pet),
            'location': 'Animal Shelter',
            'contactInfo': 'shelter@example.com',
            'requirements': generate_adoption_requirements(pet)
        }

        if logger:
            logger.info('📝 Adoption posting created', {
                'petId': pet_id,
                'title': adoption_posting['title'],
                'adoptionFee': adoption_posting['adoptionFee']
            })

        # Emit adoption posted event
        if emit:
            await emit({
                'topic': 'py.adoption.posted',
                'data': {
                    'petId': pet_id,
                    'adoptionPosting': adoption_posting,
                    'nextSteps': [
                        'Share on social media',
                        'Update shelter website',
                        'Notify adoption coordinators',
                        'Prepare adoption paperwork'
                    ],
                    'timestamp': int(time.time() * 1000)
                }
            })

            # Schedule initial adoption interview
            await emit({
                'topic': 'py.interview.scheduled',
                'data': {
                    'petId': pet_id,
                    'interviewType': 'adoption_screening',
                    'scheduledAt': int(time.time() * 1000) + (7 * 24 * 60 * 60 * 1000),  # 1 week from now
                    'duration': '30 minutes',
                    'requirements': [
                        'Valid ID',
                        'Proof of residence',
                        'References from veterinarian',
                        'Home visit scheduled'
                    ],
                    'notes': f"Initial screening for {pet['name']} adoption"
                }
            })

    except Exception as error:
        if logger:
            logger.error('❌ Adoption posting failed', {'petId': pet_id, 'error': str(error)})
