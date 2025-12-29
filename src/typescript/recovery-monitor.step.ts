// steps/typescript/recovery-monitor.step.ts
import { EventConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsRecoveryMonitor',
  description: 'Monitors pet recovery progress and schedules follow-up health checks',
  subscribes: ['ts.treatment.started', 'ts.treatment.completed'],
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsRecoveryMonitor'] = async (input, { logger }) => {
  const { petId, treatmentType, treatmentStatus } = input;

  if (logger) {
    logger.info('🩺 Recovery Monitor triggered', { petId, treatmentType, treatmentStatus });
  }

  try {
    const pet = TSStore.get(petId);
    if (!pet) {
      if (logger) {
        logger.error('❌ Pet not found for recovery monitoring', { petId });
      }
      return;
    }

    if (treatmentStatus === 'started') {
      // Treatment just started - set up monitoring
      const recoveryPlan = {
        petId,
        treatmentType,
        startedAt: Date.now(),
        expectedRecoveryTime: getExpectedRecoveryTime(treatmentType),
        monitoringSchedule: generateMonitoringSchedule(treatmentType),
        milestones: generateRecoveryMilestones(treatmentType),
        currentPhase: 'initial_treatment'
      };

      if (logger) {
        logger.info('📋 Recovery plan created', {
          petId,
          treatmentType,
          expectedRecoveryTime: recoveryPlan.expectedRecoveryTime,
          milestones: recoveryPlan.milestones.length
        });
      }

      // Recovery plan created successfully (no emit - no subscribers)

    } else if (treatmentStatus === 'completed') {
      // Treatment completed - schedule follow-up
      const followUpSchedule = {
        petId,
        treatmentCompletedAt: Date.now(),
        followUpChecks: [
          { type: 'immediate', scheduledAt: Date.now() + (2 * 60 * 60 * 1000) }, // 2 hours
          { type: 'daily', scheduledAt: Date.now() + (24 * 60 * 60 * 1000) }, // 1 day
          { type: 'weekly', scheduledAt: Date.now() + (7 * 24 * 60 * 60 * 1000) } // 1 week
        ],
        recoveryIndicators: getRecoveryIndicators(treatmentType),
        readyForDischarge: false
      };

      if (logger) {
        logger.info('✅ Treatment completed, scheduling follow-up', {
          petId,
          followUpChecks: followUpSchedule.followUpChecks.length
        });
      }

      // Follow-up scheduled successfully (no emit - no subscribers)
    }

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Recovery monitoring failed', { petId, error: error.message });
    }
  }
};

function getExpectedRecoveryTime(treatmentType: string): string {
  switch (treatmentType.toLowerCase()) {
    case 'emergency surgery': return '2-4 weeks';
    case 'respiratory treatment': return '1-2 weeks';
    case 'pain management': return '3-7 days';
    case 'antibiotic treatment': return '7-14 days';
    case 'fever management': return '3-5 days';
    default: return '1-2 weeks';
  }
}

function generateMonitoringSchedule(treatmentType: string): any[] {
  const baseSchedule = [
    { time: 'every 2 hours', check: 'vital signs', priority: 'high' },
    { time: 'every 6 hours', check: 'medication compliance', priority: 'high' },
    { time: 'daily', check: 'wound healing', priority: 'medium' },
    { time: 'daily', check: 'appetite and hydration', priority: 'medium' }
  ];

  if (treatmentType.toLowerCase().includes('surgery')) {
    baseSchedule.push(
      { time: 'every 4 hours', check: 'incision site', priority: 'high' },
      { time: 'daily', check: 'mobility assessment', priority: 'medium' }
    );
  }

  if (treatmentType.toLowerCase().includes('respiratory')) {
    baseSchedule.push(
      { time: 'every 3 hours', check: 'breathing pattern', priority: 'high' },
      { time: 'daily', check: 'oxygen levels', priority: 'high' }
    );
  }

  return baseSchedule;
}

function generateRecoveryMilestones(treatmentType: string): any[] {
  const milestones = [
    { day: 1, milestone: 'Initial treatment response', status: 'pending' },
    { day: 3, milestone: 'Pain management effectiveness', status: 'pending' },
    { day: 7, milestone: 'Primary healing indicators', status: 'pending' },
    { day: 14, milestone: 'Full recovery assessment', status: 'pending' }
  ];

  if (treatmentType.toLowerCase().includes('surgery')) {
    milestones.push(
      { day: 2, milestone: 'Incision healing check', status: 'pending' },
      { day: 10, milestone: 'Stitch removal readiness', status: 'pending' }
    );
  }

  return milestones;
}

function getRecoveryIndicators(treatmentType: string): string[] {
  const baseIndicators = [
    'Normal appetite',
    'Active behavior',
    'No signs of pain',
    'Normal vital signs'
  ];

  if (treatmentType.toLowerCase().includes('surgery')) {
    baseIndicators.push('Incision healing well', 'No signs of infection', 'Good mobility');
  }

  if (treatmentType.toLowerCase().includes('respiratory')) {
    baseIndicators.push('Normal breathing pattern', 'Good oxygen saturation', 'No coughing');
  }

  return baseIndicators;
}
