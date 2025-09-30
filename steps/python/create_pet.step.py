# steps/python/create_pet.step.py
import asyncio

config = {
    "type": "api",
    "name": "PyCreatePet",
    "path": "/py/pets",
    "method": "POST",
    "emits": ["py.pet.created", "py.feeding.reminder.enqueued"],
    "flows": ["PyPetManagement"]
}

async def handler(req, ctx=None):
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
        # Fallback for import issues
        return {"status": 500, "body": {"message": "Import error"}}
    
    b = (req.get("body") or {})
    name = b.get("name")
    species = b.get("species")
    age = b.get("ageMonths")
    weight_kg = b.get("weightKg")
    symptoms = b.get("symptoms")
    
    if not isinstance(name, str) or not name.strip():
        return {"status": 400, "body": {"message": "Invalid name"}}
    if species not in ["dog","cat","bird","other"]:
        return {"status": 400, "body": {"message": "Invalid species"}}
    try:
        age_val = int(age)
    except Exception:
        return {"status": 400, "body": {"message": "Invalid ageMonths"}}
    
    # Create the pet
    pet = pet_store.create(name, species, age_val, weight_kg=weight_kg, symptoms=symptoms)
    
    if logger:
        logger.info('🐾 Pet created', {
            'petId': pet['id'], 
            'name': pet['name'], 
            'species': pet['species'], 
            'status': pet['status']
        })

    # Create & return the initial stream record (following working pattern)
    result = await streams.petCreation.set(trace_id, 'message', { 
        'message': f"Pet {pet['name']} (ID: {pet['id']}) created successfully - Species: {pet['species']}, Age: {pet['ageMonths']} months, Status: {pet['status']}"
    })
    
    if emit:
        await emit({
            'topic': 'py.pet.created',
            'data': {'petId': pet['id'], 'event': 'pet.created', 'name': pet['name'], 'species': pet['species'], 'traceId': trace_id}
        })
        
        # Enqueue feeding reminder background job
        await emit({
            'topic': 'py.feeding.reminder.enqueued',
            'data': {'petId': pet['id'], 'enqueuedAt': int(time.time() * 1000), 'traceId': trace_id}
        })
    
    # Return the stream result so it can be tracked in Workbench
    return {
        "status": 201,
        "body": result
    }
