# steps/python/set_next_feeding_reminder.job.step.py
import asyncio

config = {
    "type": "event",
    "name": "PySetNextFeedingReminder",
    "description": "Sets the next feeding reminder for a pet and updates its status",
    "subscribes": ["py.feeding.reminder.enqueued"],
    "emits": ["py.feeding.reminder.completed"],
    "flows": ["PyPetManagement"]
}

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    streams = getattr(ctx, 'streams', None) if ctx else None
    trace_id = getattr(ctx, 'traceId', None) if ctx else None
    
    try:
        import sys
        import os
        import time
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        if logger:
            logger.error('❌ Failed to set feeding reminder - import error')
        return

    pet_id = input_data.get('petId')
    enqueued_at = input_data.get('enqueuedAt')

    if logger:
        logger.info('🔄 Setting next feeding reminder', {'petId': pet_id, 'enqueuedAt': enqueued_at})

    try:
        # Calculate next feeding time (24 hours from now)
        next_feeding_at = int(time.time() * 1000) + (24 * 60 * 60 * 1000)
        
        # Fill in non-critical details
        updates = {
            'notes': 'Welcome to our pet store! We\'ll take great care of this pet.',
            'nextFeedingAt': next_feeding_at,
            'status': 'in_quarantine'  # Set status to in_quarantine here
        }

        updated_pet = pet_store.update(pet_id, updates)
        
        if not updated_pet:
            if logger:
                logger.error('❌ Failed to set feeding reminder - pet not found', {'petId': pet_id})
            return

        if logger:
            notes_preview = updated_pet.get('notes', '')[:50] + '...' if updated_pet.get('notes') else ''
            logger.info('✅ Next feeding reminder set', {
                'petId': pet_id,
                'notes': notes_preview,
                'nextFeedingAt': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime(next_feeding_at / 1000))
            })

        # Stream status updates using the simple pattern
        if streams and streams.petCreation and trace_id:
            await streams.petCreation.set(trace_id, 'message', { 
                'message': f"Pet {updated_pet['name']} entered quarantine period" 
            })

            # Check symptoms and stream appropriate updates
            if not updated_pet.get('symptoms') or len(updated_pet['symptoms']) == 0:
                await asyncio.sleep(1.0)
                await streams.petCreation.set(trace_id, 'message', { 
                    'message': f"Health check passed for {updated_pet['name']} - no symptoms found" 
                })

                await asyncio.sleep(1.0)
                await streams.petCreation.set(trace_id, 'message', { 
                    'message': f"{updated_pet['name']} is healthy and ready for adoption! ✅" 
                })
            else:
                await asyncio.sleep(1.0)
                await streams.petCreation.set(trace_id, 'message', { 
                    'message': f"Health check failed for {updated_pet['name']} - symptoms detected: {', '.join(updated_pet['symptoms'])}" 
                })

                await asyncio.sleep(1.0)
                await streams.petCreation.set(trace_id, 'message', { 
                    'message': f"{updated_pet['name']} needs medical treatment ❌" 
                })

        if emit:
            await emit({
                'topic': 'py.feeding.reminder.completed',
                'data': {
                    'petId': pet_id,
                    'event': 'feeding.reminder.completed',
                    'completedAt': int(time.time() * 1000),
                    'processingTimeMs': int(time.time() * 1000) - enqueued_at
                }
            })

    except Exception as error:
        if logger:
            logger.error('❌ Feeding reminder job error', {'petId': pet_id, 'error': str(error)})
