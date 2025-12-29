// steps/typescript/treatment-scheduler.step.ts
import { EventConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsTreatmentScheduler',
  description: 'Schedules veterinary treatment and medication for pets requiring medical care',
  subscribes: ['ts.treatment.required'],
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsTreatmentScheduler'] = async (input, { logger }) => {
  const { petId, symptoms = [], urgency } = input as { petId: string; symptoms?: string[]; urgency?: string };

  if (logger) {
    logger.info('🏥 Treatment Scheduler triggered', { petId, symptoms, urgency });
  }

  try {
    const pet = TSStore.get(petId);
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for treatment scheduling', { petId });
      }
      return;
    }

    // Determine treatment urgency based on symptoms
    const urgentSymptoms = ['bleeding', 'severe pain', 'breathing difficulty', 'unconscious'];
    const isUrgent = symptoms.some((symptom: string) => 
      urgentSymptoms.some(urgent => symptom.toLowerCase().includes(urgent))
    );

    // Schedule treatment based on urgency
    const treatmentSchedule = {
      petId,
      scheduledAt: isUrgent ? Date.now() + (2 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000), // 2 hours for urgent, 24 hours for normal
      urgency: isUrgent ? 'urgent' : 'normal',
      symptoms,
      treatmentType: determineTreatmentType(symptoms),
      estimatedDuration: isUrgent ? '2-4 hours' : '1-2 hours',
      requiredStaff: isUrgent ? ['veterinarian', 'nurse'] : ['veterinarian'],
      medication: determineMedication(symptoms)
    };

    if (logger) {
      logger.info('📅 Treatment scheduled', {
        petId,
        urgency: treatmentSchedule.urgency,
        scheduledAt: new Date(treatmentSchedule.scheduledAt).toISOString(),
        treatmentType: treatmentSchedule.treatmentType
      });
    }

    // Treatment scheduled successfully (no emit - no subscribers)

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Treatment scheduling failed', { petId, error: error.message });
    }
  }
};

function determineTreatmentType(symptoms: string[]): string {
  const symptomStr = symptoms.join(' ').toLowerCase();
  
  if (symptomStr.includes('bleeding')) return 'Emergency Surgery';
  if (symptomStr.includes('breathing')) return 'Respiratory Treatment';
  if (symptomStr.includes('pain')) return 'Pain Management';
  if (symptomStr.includes('infection')) return 'Antibiotic Treatment';
  if (symptomStr.includes('fever')) return 'Fever Management';
  
  return 'General Medical Examination';
}

function determineMedication(symptoms: string[]): string[] {
  const medication: string[] = [];
  const symptomStr = symptoms.join(' ').toLowerCase();
  
  if (symptomStr.includes('pain')) medication.push('Pain Relief (Ibuprofen)');
  if (symptomStr.includes('infection')) medication.push('Antibiotics (Amoxicillin)');
  if (symptomStr.includes('fever')) medication.push('Fever Reducer (Acetaminophen)');
  if (symptomStr.includes('anxiety')) medication.push('Anti-anxiety (Diazepam)');
  
  return medication;
}

function generateMedicationInstructions(medication: string[]): string[] {
  return medication.map(med => {
    if (med.includes('Pain Relief')) return 'Give 1 tablet every 8 hours with food';
    if (med.includes('Antibiotics')) return 'Give 1 tablet every 12 hours for 7 days';
    if (med.includes('Fever Reducer')) return 'Give 1 tablet every 6 hours as needed';
    if (med.includes('Anti-anxiety')) return 'Give 1 tablet every 12 hours during stressful periods';
    return 'Follow veterinarian instructions';
  });
}
