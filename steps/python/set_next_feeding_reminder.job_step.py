# steps/python/set_next_feeding_reminder.job.step.py

config = {
    "type": "event",
    "name": "PySetNextFeedingReminder",
    "description": "Background job that sets next feeding reminder and adds welcome notes",
    "subscribes": ["py.feeding.reminder.enqueued"],
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
            'nextFeedingAt': next_feeding_at
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
