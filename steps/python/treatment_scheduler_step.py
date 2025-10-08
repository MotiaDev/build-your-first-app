# steps/python/treatment_scheduler.step.py
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

config = {
    "type": "event",
    "name": "PyTreatmentScheduler",
    "description": "Schedules veterinary treatment and medication for pets requiring medical care",
    "subscribes": ["py.treatment.required"],
    "emits": [],
    "flows": ["PyPetManagement"]
}

def determine_treatment_type(symptoms):
    symptom_str = ' '.join(symptoms).lower()
    
    if 'bleeding' in symptom_str:
        return 'Emergency Surgery'
    if 'breathing' in symptom_str:
        return 'Respiratory Treatment'
    if 'pain' in symptom_str:
        return 'Pain Management'
    if 'infection' in symptom_str:
        return 'Antibiotic Treatment'
    if 'fever' in symptom_str:
        return 'Fever Management'
    
    return 'General Medical Examination'

def determine_medication(symptoms):
    medication = []
    symptom_str = ' '.join(symptoms).lower()
    
    if 'pain' in symptom_str:
        medication.append('Pain Relief (Ibuprofen)')
    if 'infection' in symptom_str:
        medication.append('Antibiotics (Amoxicillin)')
    if 'fever' in symptom_str:
        medication.append('Fever Reducer (Acetaminophen)')
    if 'anxiety' in symptom_str:
        medication.append('Anti-anxiety (Diazepam)')
    
    return medication

def generate_medication_instructions(medication):
    instructions = []
    for med in medication:
        if 'Pain Relief' in med:
            instructions.append('Give 1 tablet every 8 hours with food')
        elif 'Antibiotics' in med:
            instructions.append('Give 1 tablet every 12 hours for 7 days')
        elif 'Fever Reducer' in med:
            instructions.append('Give 1 tablet every 6 hours as needed')
        elif 'Anti-anxiety' in med:
            instructions.append('Give 1 tablet every 12 hours during stressful periods')
        else:
            instructions.append('Follow veterinarian instructions')
    return instructions

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    
    pet_id = input_data.get('petId')
    symptoms = input_data.get('symptoms', [])
    urgency = input_data.get('urgency', 'normal')

    if logger:
        logger.info('🏥 Treatment Scheduler triggered', {'petId': pet_id, 'symptoms': symptoms, 'urgency': urgency})

    try:
        pet = pet_store.get(pet_id)
        if not pet:
            if logger:
                logger.error('❌ Pet not found for treatment scheduling', {'petId': pet_id})
            return

        # Determine treatment urgency based on symptoms
        urgent_symptoms = ['bleeding', 'severe pain', 'breathing difficulty', 'unconscious']
        is_urgent = any(any(urgent in symptom.lower() for urgent in urgent_symptoms) for symptom in symptoms)

        # Schedule treatment based on urgency
        treatment_schedule = {
            'petId': pet_id,
            'scheduledAt': int(time.time() * 1000) + (2 * 60 * 60 * 1000 if is_urgent else 24 * 60 * 60 * 1000),
            'urgency': 'urgent' if is_urgent else 'normal',
            'symptoms': symptoms,
            'treatmentType': determine_treatment_type(symptoms),
            'estimatedDuration': '2-4 hours' if is_urgent else '1-2 hours',
            'requiredStaff': ['veterinarian', 'nurse'] if is_urgent else ['veterinarian'],
            'medication': determine_medication(symptoms)
        }

        if logger:
            logger.info('📅 Treatment scheduled', {
                'petId': pet_id,
                'urgency': treatment_schedule['urgency'],
                'scheduledAt': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(treatment_schedule['scheduledAt'] / 1000)),
                'treatmentType': treatment_schedule['treatmentType']
            })

        # Treatment scheduled successfully (no emit - no subscribers)

    except Exception as error:
        if logger:
            logger.error('❌ Treatment scheduling failed', {'petId': pet_id, 'error': str(error)})
