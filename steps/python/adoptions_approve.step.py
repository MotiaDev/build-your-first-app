# steps/python/adoptions_approve.step.py
import time
import random
import string

config = { "type":"api", "name":"PyAdoptionApply", "path":"/py/adoptions/apply", "method":"POST", "emits":["py.adoption.applied"], "flows":["pets"] }

async def handler(req, ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    
    body = req.get("body") or {}
    pet_id = str(body.get("petId") or "")
    adopter_name = str(body.get("adopterName") or "")
    adopter_email = str(body.get("adopterEmail") or "")
    
    # Validate required fields
    if not pet_id or not adopter_name or not adopter_email:
        return {
            "status": 400,
            "body": {"message": "Missing required fields: petId, adopterName, adopterEmail"}
        }
    
    # Check if pet exists
    pet = pet_store.get(pet_id)
    if not pet:
        return {"status": 404, "body": {"message": "Pet not found"}}
    
    # Check if pet is available
    if pet.get("status") != "available":
        return {
            "status": 400,
            "body": {"message": f"Pet is not available (current status: {pet.get('status')})"}
        }
    
    # Generate application ID
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    application_id = f"app-{int(time.time() * 1000)}-{random_suffix}"
    
    # Update pet status to pending
    pet_store.update(pet_id, {"status": "pending"})
    
    logger = (ctx or {}).get("logger")
    if logger: 
        logger.info("Application submitted", {
            "applicationId": application_id, 
            "petId": pet_id, 
            "petName": pet["name"], 
            "adopterName": adopter_name
        })
    
    emitter = (ctx or {}).get("emit")
    if emitter:
        await emitter({ 
            "topic":"py.adoption.applied", 
            "data": { 
                "applicationId": application_id, 
                "petId": pet_id, 
                "petName": pet["name"],
                "adopterName": adopter_name,
                "adopterEmail": adopter_email
            } 
        })
    
    return {
        "status": 201,
        "body": {
            "applicationId": application_id,
            "petId": pet_id,
            "petName": pet["name"],
            "status": "pending_check"
        }
    }
