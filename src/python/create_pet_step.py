# src/python/create_pet.step.py
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
    symptoms = b.get("symptoms")
    weight_kg = b.get("weightKg")
    
    if not isinstance(name, str) or not name.strip():
        return {"status": 400, "body": {"message": "Invalid name"}}
    if species not in ["dog","cat","bird","other"]:
        return {"status": 400, "body": {"message": "Invalid species"}}
    try:
        age_val = int(age)
    except Exception:
        return {"status": 400, "body": {"message": "Invalid ageMonths"}}
    
    # Create pet with optional fields
    pet = pet_store.create(
        name, 
        species, 
        age_val,
        symptoms=symptoms if isinstance(symptoms, list) else None,
        weightKg=float(weight_kg) if weight_kg is not None else None
    )
    
    if logger:
        logger.info('🐾 Pet created', {
            'petId': pet['id'], 
            'name': pet['name'], 
            'species': pet['species'], 
            'status': pet['status']
        })
    
    if emit:
        await emit({
            'topic': 'py.pet.created',
            'data': {'petId': pet['id'], 'event': 'pet.created', 'name': pet['name'], 'species': pet['species']}
        })
        
        # Enqueue feeding reminder background job
        await emit({
            'topic': 'py.feeding.reminder.enqueued',
            'data': {'petId': pet['id'], 'enqueuedAt': int(time.time() * 1000)}
        })
    
    return {"status": 201, "body": pet}
