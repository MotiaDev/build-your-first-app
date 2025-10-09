# steps/python/recovery_monitor.step.py
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

config = {
    "type": "event",
    "name": "PyRecoveryMonitor",
    "description": "Monitors pet recovery progress and schedules follow-up health checks",
    "subscribes": ["py.treatment.started", "py.treatment.completed"],
    "emits": [],
    "flows": ["PyPetManagement"]
}

def get_expected_recovery_time(treatment_type):
    treatment_lower = treatment_type.lower()
    if 'emergency surgery' in treatment_lower:
        return '2-4 weeks'
    elif 'respiratory treatment' in treatment_lower:
        return '1-2 weeks'
    elif 'pain management' in treatment_lower:
        return '3-7 days'
    elif 'antibiotic treatment' in treatment_lower:
        return '7-14 days'
    elif 'fever management' in treatment_lower:
        return '3-5 days'
    else:
        return '1-2 weeks'

def generate_monitoring_schedule(treatment_type):
    base_schedule = [
        {'time': 'every 2 hours', 'check': 'vital signs', 'priority': 'high'},
        {'time': 'every 6 hours', 'check': 'medication compliance', 'priority': 'high'},
        {'time': 'daily', 'check': 'wound healing', 'priority': 'medium'},
        {'time': 'daily', 'check': 'appetite and hydration', 'priority': 'medium'}
    ]

    treatment_lower = treatment_type.lower()
    if 'surgery' in treatment_lower:
        base_schedule.extend([
            {'time': 'every 4 hours', 'check': 'incision site', 'priority': 'high'},
            {'time': 'daily', 'check': 'mobility assessment', 'priority': 'medium'}
        ])

    if 'respiratory' in treatment_lower:
        base_schedule.extend([
            {'time': 'every 3 hours', 'check': 'breathing pattern', 'priority': 'high'},
            {'time': 'daily', 'check': 'oxygen levels', 'priority': 'high'}
        ])

    return base_schedule

def generate_recovery_milestones(treatment_type):
    milestones = [
        {'day': 1, 'milestone': 'Initial treatment response', 'status': 'pending'},
        {'day': 3, 'milestone': 'Pain management effectiveness', 'status': 'pending'},
        {'day': 7, 'milestone': 'Primary healing indicators', 'status': 'pending'},
        {'day': 14, 'milestone': 'Full recovery assessment', 'status': 'pending'}
    ]

    treatment_lower = treatment_type.lower()
    if 'surgery' in treatment_lower:
        milestones.extend([
            {'day': 2, 'milestone': 'Incision healing check', 'status': 'pending'},
            {'day': 10, 'milestone': 'Stitch removal readiness', 'status': 'pending'}
        ])

    return milestones

def get_recovery_indicators(treatment_type):
    base_indicators = [
        'Normal appetite',
        'Active behavior',
        'No signs of pain',
        'Normal vital signs'
    ]

    treatment_lower = treatment_type.lower()
    if 'surgery' in treatment_lower:
        base_indicators.extend(['Incision healing well', 'No signs of infection', 'Good mobility'])

    if 'respiratory' in treatment_lower:
        base_indicators.extend(['Normal breathing pattern', 'Good oxygen saturation', 'No coughing'])

    return base_indicators

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    pet_id = input_data.get('petId')
    treatment_type = input_data.get('treatmentType', 'general')
    treatment_status = input_data.get('treatmentStatus')

    if logger:
        logger.info('🩺 Recovery Monitor triggered', {'petId': pet_id, 'treatmentType': treatment_type, 'treatmentStatus': treatment_status})

    try:
        pet = pet_store.get(pet_id)
        if not pet:
            if logger:
                logger.error('❌ Pet not found for recovery monitoring', {'petId': pet_id})
            return

        if treatment_status == 'started':
            # Treatment just started - set up monitoring
            recovery_plan = {
                'petId': pet_id,
                'treatmentType': treatment_type,
                'startedAt': int(time.time() * 1000),
                'expectedRecoveryTime': get_expected_recovery_time(treatment_type),
                'monitoringSchedule': generate_monitoring_schedule(treatment_type),
                'milestones': generate_recovery_milestones(treatment_type),
                'currentPhase': 'initial_treatment'
            }

            if logger:
                logger.info('📋 Recovery plan created', {
                    'petId': pet_id,
                    'treatmentType': treatment_type,
                    'expectedRecoveryTime': recovery_plan['expectedRecoveryTime'],
                    'milestones': len(recovery_plan['milestones'])
                })

            if emit:
                await emit({
                    'topic': 'py.recovery.progress',
                    'data': {
                        'petId': pet_id,
                        'recoveryPlan': recovery_plan,
                        'nextSteps': [
                            'Begin treatment monitoring',
                            'Schedule daily health checks',
                            'Update medication schedule',
                            'Notify staff of special care requirements'
                        ],
                        'timestamp': int(time.time() * 1000)
                    }
                })

        elif treatment_status == 'completed':
            # Treatment completed - schedule follow-up
            follow_up_schedule = {
                'petId': pet_id,
                'treatmentCompletedAt': int(time.time() * 1000),
                'followUpChecks': [
                    {'type': 'immediate', 'scheduledAt': int(time.time() * 1000) + (2 * 60 * 60 * 1000)},  # 2 hours
                    {'type': 'daily', 'scheduledAt': int(time.time() * 1000) + (24 * 60 * 60 * 1000)},  # 1 day
                    {'type': 'weekly', 'scheduledAt': int(time.time() * 1000) + (7 * 24 * 60 * 60 * 1000)}  # 1 week
                ],
                'recoveryIndicators': get_recovery_indicators(treatment_type),
                'readyForDischarge': False
            }

            if logger:
                logger.info('✅ Treatment completed, scheduling follow-up', {
                    'petId': pet_id,
                    'followUpChecks': len(follow_up_schedule['followUpChecks'])
                })

            if emit:
                await emit({
                    'topic': 'py.health.check.scheduled',
                    'data': {
                        'petId': pet_id,
                        'followUpSchedule': follow_up_schedule,
                        'nextSteps': [
                            'Monitor recovery indicators',
                            'Schedule follow-up appointments',
                            'Prepare discharge paperwork',
                            'Update pet status when ready'
                        ],
                        'timestamp': int(time.time() * 1000)
                    }
                })

    except Exception as error:
        if logger:
            logger.error('❌ Recovery monitoring failed', {'petId': pet_id, 'error': str(error)})
