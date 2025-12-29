# steps/python/update_pet.step.py
config = { 
    "type": "api", 
    "name": "PyUpdatePet", 
    "path": "/py/pets/:id", 
    "method": "PUT", 
    "emits": ["py.pet.status.update.requested"], 
    "flows": ["PyPetManagement"] 
}

async def handler(req, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    
    pet_id = req.get("pathParams", {}).get("id")
    b = req.get("body") or {}
    
    # Check if pet exists
    current_pet = pet_store.get(pet_id)
    if not current_pet:
        return {"status": 404, "body": {"message": "Not found"}}

    # Handle status updates through orchestrator
    if b.get("status") and b["status"] != current_pet["status"]:
        valid_statuses = ['new','in_quarantine','healthy','available','pending','adopted','ill','under_treatment','recovered','deleted']
        
        if b["status"] not in valid_statuses:
            return {"status": 400, "body": {"message": "Invalid status"}}

        if logger:
            logger.info('👤 Staff requesting status change', {
                'petId': pet_id,
                'currentStatus': current_pet["status"],
                'requestedStatus': b["status"]
            })

        # Emit to orchestrator for validation and processing
        if emit:
            await emit({
                'topic': 'py.pet.status.update.requested',
                'data': {
                    'petId': pet_id,
                    'event': 'status.update.requested',
                    'requestedStatus': b["status"],
                    'currentStatus': current_pet["status"]
                }
            })

        # Return current pet - orchestrator will handle the actual status change
        return {"status": 202, "body": {
            "message": "Status change request submitted",
            "petId": pet_id,
            "currentStatus": current_pet["status"],
            "requestedStatus": b["status"]
        }}

    # Handle non-status updates normally
    patch = {}
    if isinstance(b.get("name"), str): 
        patch["name"] = b["name"]
    if b.get("species") in ["dog","cat","bird","other"]: 
        patch["species"] = b["species"]
    if isinstance(b.get("ageMonths"), (int, float, str)):
        try: 
            patch["ageMonths"] = int(b["ageMonths"])
        except Exception: 
            pass
    if isinstance(b.get("notes"), str): 
        patch["notes"] = b["notes"]
    if isinstance(b.get("nextFeedingAt"), (int, float)):
        patch["nextFeedingAt"] = int(b["nextFeedingAt"])

    updated = pet_store.update(pet_id, patch)
    return {"status": 200, "body": updated} if updated else {"status": 404, "body": {"message": "Not found"}}
