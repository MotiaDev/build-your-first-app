# steps/python/deletion_reaper.cron.step.py
config = {
    "type": "cron",
    "name": "PyDeletionReaper",
    "description": "Daily job that permanently removes pets scheduled for deletion",
    "cron": "0 2 * * *",  # Daily at 2:00 AM
    "emits": [],
    "flows": ["PyPetManagement"]
}

async def handler(ctx):
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
            logger.error('❌ Deletion Reaper failed - import error')
        return

    if logger:
        logger.info('🔄 Deletion Reaper started - scanning for pets to purge')

    try:
        pets_to_reap = pet_store.find_deleted_pets_ready_to_purge()
        
        if not pets_to_reap:
            if logger:
                logger.info('✅ Deletion Reaper completed - no pets to purge')
            
            if emit:
                await emit({
                    'topic': 'py.reaper.completed',
                    'data': {
                        'scannedAt': int(time.time() * 1000),
                        'purgedCount': 0,
                        'message': 'No pets ready for purging'
                    }
                })
            return

        purged_count = 0
        
        for pet in pets_to_reap:
            success = pet_store.remove(pet['id'])
            
            if success:
                purged_count += 1
                
                if logger:
                    logger.info('💀 Pet permanently purged', {
                        'petId': pet['id'],
                        'name': pet['name'],
                        'deletedAt': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(pet['deletedAt'] / 1000)),
                        'purgeAt': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(pet['purgeAt'] / 1000))
                    })

                if emit:
                    await emit({
                        'topic': 'py.pet.purged',
                        'data': {
                            'petId': pet['id'],
                            'name': pet['name'],
                            'species': pet['species'],
                            'deletedAt': pet['deletedAt'],
                            'purgedAt': int(time.time() * 1000)
                        }
                    })
            else:
                if logger:
                    logger.warn('⚠️ Failed to purge pet', {'petId': pet['id'], 'name': pet['name']})

        if logger:
            logger.info('✅ Deletion Reaper completed', {
                'totalScanned': len(pets_to_reap),
                'purgedCount': purged_count,
                'failedCount': len(pets_to_reap) - purged_count
            })

        if emit:
            await emit({
                'topic': 'py.reaper.completed',
                'data': {
                    'scannedAt': int(time.time() * 1000),
                    'purgedCount': purged_count,
                    'totalScanned': len(pets_to_reap)
                }
            })

    except Exception as error:
        if logger:
            logger.error('❌ Deletion Reaper error', {'error': str(error)})
