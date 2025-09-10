# steps/python/adoption_followup_event.step.py
import asyncio

config = {
    "type": "event",
    "name": "PyAdoptionFollowup",
    "subscribes": ["py.adoption.approved"],
    "emits": [],
    "flows": ["pets"]
}

async def handler(event, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"success": False, "message": "Import error"}
    
    # Try both event.data and direct event access
    event_data = event.get("data", event)
    pet_id = event_data.get("petId")
    application_id = event_data.get("applicationId")
    
    if not pet_id:
        print("❌ No pet ID provided in adoption event")
        return {"success": False, "message": "Missing pet ID"}
    
    pet = pet_store.get(pet_id)
    if not pet:
        print(f"❌ Pet with ID {pet_id} not found")
        return {"success": False, "message": "Pet not found"}
    
    # Log to both console and structured logger
    print(f"📧 Sending adoption follow-up for {pet['name']}")
    if logger:
        logger.info("Adoption follow-up sent", {
            "petId": pet_id,
            "petName": pet["name"],
            "applicationId": application_id,
            "species": pet["species"]
        })
    
    # Simulate sending follow-up email/notification
    await asyncio.sleep(0.1)
    
    return {
        "success": True,
        "message": f"Follow-up sent for {pet['name']}'s adoption",
        "petName": pet["name"],
        "applicationId": application_id
    }
