# steps/python/pet_lifecycle_orchestrator.step.py

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
        'from': ['under_treatment'],
        'to': 'recovered',
        'event': 'status.update.requested',
        'description': 'Staff assessment - treatment completed'
    },
    {
        'from': ['recovered'],
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
    }
]

config = {
    "type": "event",
    "name": "PyPetLifecycleOrchestrator",
    "description": "Pet lifecycle state management with staff interaction points",
    "subscribes": [
        "py.pet.created", 
        "py.feeding.reminder.completed",
        "py.pet.status.update.requested"
    ],
    "emits": [],
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

        # Check for idempotency
        if pet['status'] == rule['to']:
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

            # Check for automatic progressions after successful transition
            await check_automatic_progressions(pet_id, rule['to'], emit, logger)

    except Exception as error:
        if logger:
            logger.error('❌ Lifecycle orchestrator error', {'petId': pet_id, 'eventType': event_type, 'error': str(error)})

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