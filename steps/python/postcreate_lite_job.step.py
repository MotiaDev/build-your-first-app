# steps/python/postcreate_lite_job.step.py
config = {
    "type": "event",
    "name": "PyPostCreateLite",
    "description": "Background job that fills in non-critical details after pet creation",
    "subscribes": ["py.job.postcreate.enqueued"],
    "emits": ["py.job.postcreate.completed"],
    "flows": ["pets"]
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
            logger.error('❌ PostCreateLite job failed - import error')
        return

    pet_id = input_data.get('petId')
    enqueued_at = input_data.get('enqueuedAt', 0)

    if logger:
        logger.info('🔄 PostCreateLite job started', {'petId': pet_id, 'enqueuedAt': enqueued_at})

    try:
        # Calculate next feeding time (24 hours from now)
        now_ms = int(time.time() * 1000)
        next_feeding_at = now_ms + (24 * 60 * 60 * 1000)
        
        # Fill in non-critical details
        updates = {
            'notes': 'Welcome to our pet store! We\'ll take great care of this pet.',
            'nextFeedingAt': next_feeding_at
        }

        updated_pet = pet_store.update(pet_id, updates)
        
        if not updated_pet:
            if logger:
                logger.error('❌ PostCreateLite job failed - pet not found', {'petId': pet_id})
            return

        if logger:
            logger.info('✅ PostCreateLite job completed', {
                'petId': pet_id,
                'notes': updated_pet['notes'][:50] + '...' if updated_pet.get('notes') else '',
                'nextFeedingAt': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(next_feeding_at / 1000))
            })

        if emit:
            await emit({
                'topic': 'py.job.postcreate.completed',
                'data': {
                    'petId': pet_id,
                    'completedAt': now_ms,
                    'processingTimeMs': now_ms - enqueued_at
                }
            })

    except Exception as error:
        if logger:
            logger.error('❌ PostCreateLite job error', {'petId': pet_id, 'error': str(error)})
