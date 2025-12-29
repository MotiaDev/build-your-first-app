# steps/python/delete_pet.step.py
config = { "type":"api", "name":"PyDeletePet", "path":"/py/pets/:id", "method":"DELETE", "emits": [], "flows": ["PyPetManagement"] }

async def handler(req, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    try:
        import sys
        import os
        import time
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    
    pet_id = req.get("pathParams", {}).get("id")
    deleted_pet = pet_store.soft_delete(pet_id)
    
    if not deleted_pet:
        return {"status": 404, "body": {"message": "Not found"}}

    if logger:
        logger.info('🗑️ Pet soft deleted', {
            'petId': deleted_pet['id'],
            'name': deleted_pet['name'],
            'purgeAt': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(deleted_pet['purgeAt'] / 1000))
        })

    if emit:
        await emit({
            'topic': 'py.pet.soft.deleted',
            'data': {
                'petId': deleted_pet['id'],
                'name': deleted_pet['name'],
                'purgeAt': deleted_pet['purgeAt']
            }
        })

    return {
        "status": 202,
        "body": {
            "message": "Pet scheduled for deletion",
            "petId": deleted_pet['id'],
            "purgeAt": deleted_pet['purgeAt']
        }
    }