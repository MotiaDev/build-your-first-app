# steps/python/pet_lifecycle_orchestrator.step.py
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

# Guard checking functions
def check_guards(pet, guards):
    """Check if all guards pass for a transition"""
    for guard in guards:
        if guard == 'must_be_healthy':
            if pet['status'] != 'healthy':
                return {'passed': False, 'reason': f"Pet must be healthy (current: {pet['status']})"}
        elif guard == 'no_needs_data_flag':
            if pet.get('flags') and 'needs_data' in pet['flags']:
                return {'passed': False, 'reason': 'Pet has needs_data flag blocking adoption'}
        else:
            return {'passed': False, 'reason': f'Unknown guard: {guard}'}
    return {'passed': True}

TRANSITION_RULES = [
    {
        'from': ['new'],
        'to': 'in_quarantine',
        'event': 'feeding.reminder.completed',
        'description': 'Pet moved to quarantine after feeding setup'
    },
    {
        'from': ['in_quarantine'],
        'to': 'healthy',
        'event': 'status.update.requested',
        'description': 'Staff health check - pet cleared from quarantine'
    },
    {
        'from': ['healthy', 'in_quarantine', 'available'],
        'to': 'ill',
        'event': 'status.update.requested',
        'description': 'Staff assessment - pet identified as ill'
    },
    {
        'from': ['healthy'],
        'to': 'available',
        'event': 'status.update.requested',
        'description': 'Staff decision - pet ready for adoption'
    },
    {
        'from': ['ill'],
        'to': 'under_treatment',
        'event': 'status.update.requested',
        'description': 'Staff decision - treatment started'
    },
    {
        'from': ['under_treatment', 'ill'],
        'to': 'recovered',
        'event': 'status.update.requested',
        'description': 'Staff assessment - treatment completed'
    },
    {
        'from': ['recovered', 'new'],
        'to': 'healthy',
        'event': 'status.update.requested',
        'description': 'Staff clearance - pet fully recovered'
    },
    {
        'from': ['available'],
        'to': 'pending',
        'event': 'status.update.requested',
        'description': 'Adoption application received'
    },
    {
        'from': ['pending'],
        'to': 'adopted',
        'event': 'status.update.requested',
        'description': 'Adoption completed'
    },
    {
        'from': ['pending'],
        'to': 'available',
        'event': 'status.update.requested',
        'description': 'Adoption application rejected/cancelled'
    },
    # Agent-driven health transitions
    {
        'from': ['healthy', 'in_quarantine'],
        'to': 'ill',
        'event': 'health.treatment_required',
        'description': 'Agent assessment - pet requires medical treatment'
    },
    {
        'from': ['healthy', 'in_quarantine'],
        'to': 'healthy',
        'event': 'health.no_treatment_needed',
        'description': 'Agent assessment - pet remains healthy'
    },
    # Agent-driven adoption transitions
    {
        'from': ['healthy'],
        'to': 'healthy',
        'event': 'adoption.needs_data',
        'description': 'Agent assessment - pet needs additional data before adoption',
        'flagAction': {'action': 'add', 'flag': 'needs_data'}
    },
    {
        'from': ['healthy'],
        'to': 'available',
        'event': 'adoption.ready',
        'description': 'Agent assessment - pet ready for adoption',
        'guards': ['no_needs_data_flag']
    }
]

config = {
    "type": "event",
    "name": "PyPetLifecycleOrchestrator",
    "description": "Pet lifecycle state management with staff interaction points",
    "subscribes": [
        "py.feeding.reminder.completed",
        "py.pet.status.update.requested",
        "py.health.treatment_required",
        "py.health.no_treatment_needed",
        "py.adoption.needs_data",
        "py.adoption.ready"
    ],
    "emits": [ 
        "py.treatment.required",
        "py.adoption.ready",
        "py.treatment.completed", 
    ],
    "flows": ["PyPetManagement"]
}

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    try:
        import sys
        import os
        import time
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        if logger:
            logger.error('❌ Lifecycle orchestrator failed - import error')
        return

    pet_id = input_data.get('petId')
    event_type = input_data.get('event')
    requested_status = input_data.get('requestedStatus')
    automatic = input_data.get('automatic', False)

    if logger:
        log_message = '🤖 Automatic progression' if automatic else '🔄 Lifecycle orchestrator processing'
        logger.info(log_message, {'petId': pet_id, 'eventType': event_type, 'requestedStatus': requested_status, 'automatic': automatic})

    try:
        pet = pet_store.get(pet_id)
        if not pet:
            if logger:
                logger.error('❌ Pet not found for lifecycle transition', {'petId': pet_id, 'eventType': event_type})
            return

        # For status update requests, find the rule based on requested status
        rule = None
        if event_type == 'status.update.requested' and requested_status:
            for r in TRANSITION_RULES:
                if (r['event'] == event_type and 
                    pet['status'] in r['from'] and 
                    r['to'] == requested_status):
                    rule = r
                    break
        else:
            # For other events (like feeding.reminder.completed)
            for r in TRANSITION_RULES:
                if r['event'] == event_type and pet['status'] in r['from']:
                    rule = r
                    break

        if not rule:
            reason = (f"Invalid transition: cannot change from {pet['status']} to {requested_status}" 
                     if event_type == 'status.update.requested' 
                     else f"No transition rule found for {event_type} from {pet['status']}")
                
            if logger:
                logger.warn('⚠️ Transition rejected', {
                    'petId': pet_id,
                    'currentStatus': pet['status'],
                    'requestedStatus': requested_status,
                    'eventType': event_type,
                    'reason': reason
                })
            
            if emit:
                await emit({
                    'topic': 'py.lifecycle.transition.rejected',
                    'data': {
                        'petId': pet_id,
                        'currentStatus': pet['status'],
                        'requestedStatus': requested_status,
                        'eventType': event_type,
                        'reason': reason,
                        'timestamp': int(time.time() * 1000)
                    }
                })
            return

        # Check guards if present
        if rule.get('guards'):
            guard_result = check_guards(pet, rule['guards'])
            if not guard_result['passed']:
                if logger:
                    logger.warn('⚠️ Transition blocked by guard', {
                        'petId': pet_id,
                        'eventType': event_type,
                        'guard': guard_result['reason'],
                        'currentStatus': pet['status']
                    })

                if emit:
                    await emit({
                        'topic': 'py.lifecycle.transition.rejected',
                        'data': {
                            'petId': pet_id,
                            'currentStatus': pet['status'],
                            'requestedStatus': rule['to'],
                            'eventType': event_type,
                            'reason': f"Guard check failed: {guard_result['reason']}",
                            'timestamp': int(time.time() * 1000)
                        }
                    })
                return

        # Check for idempotency
        if pet['status'] == rule['to'] and not rule.get('flagAction'):
            if logger:
                logger.info('✅ Already in target status', {
                    'petId': pet_id,
                    'status': pet['status'],
                    'eventType': event_type
                })
            return

        # Apply the transition
        old_status = pet['status']
        updated_pet = pet_store.update_status(pet_id, rule['to'])
        
        if not updated_pet:
            if logger:
                logger.error('❌ Failed to update pet status', {'petId': pet_id, 'oldStatus': old_status, 'newStatus': rule['to']})
            return

        # Apply flag actions if present
        if rule.get('flagAction'):
            flag_action = rule['flagAction']
            if flag_action['action'] == 'add':
                updated_pet = pet_store.add_flag(pet_id, flag_action['flag'])
                if logger:
                    logger.info('🏷️ Flag added by orchestrator', {'petId': pet_id, 'flag': flag_action['flag']})
            elif flag_action['action'] == 'remove':
                updated_pet = pet_store.remove_flag(pet_id, flag_action['flag'])
                if logger:
                    logger.info('🏷️ Flag removed by orchestrator', {'petId': pet_id, 'flag': flag_action['flag']})

        if logger:
            logger.info('✅ Lifecycle transition completed', {
                'petId': pet_id,
                'oldStatus': old_status,
                'newStatus': rule['to'],
                'eventType': event_type,
                'description': rule['description'],
                'timestamp': int(time.time() * 1000)
            })

        if emit:
            await emit({
                'topic': 'py.lifecycle.transition.completed',
                'data': {
                    'petId': pet_id,
                    'oldStatus': old_status,
                    'newStatus': rule['to'],
                    'eventType': event_type,
                    'description': rule['description'],
                    'timestamp': int(time.time() * 1000)
                }
            })

            # Emit next action events based on status change
            await emit_next_action_events(pet_id, rule['to'], old_status, updated_pet, emit, logger)

            # Check for automatic progressions after successful transition
            await check_automatic_progressions(pet_id, rule['to'], emit, logger)

    except Exception as error:
        if logger:
            logger.error('❌ Lifecycle orchestrator error', {'petId': pet_id, 'eventType': event_type, 'error': str(error)})

async def emit_next_action_events(pet_id, new_status, old_status, pet, emit, logger):
    try:
        # Emit specific next action events based on status change
        if new_status == 'under_treatment' and old_status == 'ill':
            await emit({
                'topic': 'py.treatment.required',
                'data': {
                    'petId': pet_id,
                    'symptoms': pet.get('symptoms', []),
                    'urgency': 'normal',
                    'profile': pet.get('profile'),
                    'timestamp': int(time.time() * 1000)
                }
            })
            if logger:
                logger.info('🏥 Treatment required event emitted', {'petId': pet_id})

        elif new_status == 'available' and old_status == 'healthy':
            await emit({
                'topic': 'py.adoption.ready',
                'data': {
                    'petId': pet_id,
                    'profile': pet.get('profile'),
                    'temperament': pet.get('profile', {}).get('temperamentTags', []),
                    'adopterHints': pet.get('profile', {}).get('adopterHints', []),
                    'timestamp': int(time.time() * 1000)
                }
            })
            if logger:
                logger.info('🏠 Adoption ready event emitted', {'petId': pet_id})

        elif new_status == 'recovered' and old_status == 'under_treatment':
            await emit({
                'topic': 'py.treatment.completed',
                'data': {
                    'petId': pet_id,
                    'treatmentType': 'general_recovery',
                    'treatmentStatus': 'completed',
                    'timestamp': int(time.time() * 1000)
                }
            })
            if logger:
                logger.info('✅ Treatment completed event emitted', {'petId': pet_id})

        elif new_status == 'healthy' and old_status == 'recovered':
            await emit({
                'topic': 'py.health.restored',
                'data': {
                    'petId': pet_id,
                    'recoveryComplete': True,
                    'nextSteps': ['Schedule routine health check', 'Consider adoption readiness'],
                    'timestamp': int(time.time() * 1000)
                }
            })
            if logger:
                logger.info('💚 Health restored event emitted', {'petId': pet_id})

    except Exception as error:
        if logger:
            logger.error('❌ Failed to emit next action events', {'petId': pet_id, 'newStatus': new_status, 'error': str(error)})

async def check_automatic_progressions(pet_id, current_status, emit, logger):
    # Define automatic progressions
    automatic_progressions = {
        'healthy': {'to': 'available', 'description': 'Automatic progression - pet ready for adoption'},
        'ill': {'to': 'under_treatment', 'description': 'Automatic progression - treatment started'},
        'recovered': {'to': 'healthy', 'description': 'Automatic progression - recovery complete'}
    }

    progression = automatic_progressions.get(current_status)
    if progression:
        if logger:
            logger.info('🤖 Orchestrator triggering automatic progression', {
                'petId': pet_id,
                'currentStatus': current_status,
                'nextStatus': progression['to']
            })

        # Emit automatic progression event with delay
        import asyncio
        async def delayed_emit():
            await asyncio.sleep(1.5)  # Slightly longer delay to ensure current transition completes
            # Get fresh pet status to ensure we have the latest state
            try:
                import sys
                import os
                sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
                from services import pet_store
                fresh_pet = pet_store.get(pet_id)
                if fresh_pet and fresh_pet['status'] == current_status:
                    await emit({
                        'topic': 'py.pet.status.update.requested',
                        'data': {
                            'petId': pet_id,
                            'event': 'status.update.requested',
                            'requestedStatus': progression['to'],
                            'currentStatus': fresh_pet['status'],
                            'automatic': True
                        }
                    })
                elif logger:
                    logger.warn('⚠️ Automatic progression skipped - pet status changed', {
                        'petId': pet_id,
                        'expectedStatus': current_status,
                        'actualStatus': fresh_pet['status'] if fresh_pet else None
                    })
            except Exception as e:
                if logger:
                    logger.error('❌ Automatic progression error', {'petId': pet_id, 'error': str(e)})
        
        asyncio.create_task(delayed_emit())