# steps/python/adoption_check.step.py
import asyncio
import time

config = {
    "type": "event",
    "name": "PyAdoptionCheck",
    "subscribes": ["py.adoption.applied"],
    "emits": ["py.adoption.checked"],
    "flows": ["pets"]
}

async def handler(event, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    event_data = event.get("data", event)
    application_id = event_data.get("applicationId")
    pet_id = event_data.get("petId")
    pet_name = event_data.get("petName")
    adopter_name = event_data.get("adopterName")
    adopter_email = event_data.get("adopterEmail")
    
    if not application_id:
        print("❌ No application ID provided in adoption.applied event")
        return {"success": False, "message": "Missing application ID"}
    
    # Simulate background check process
    print(f"🔍 Running background check for {adopter_name}...")
    
    # Simulate async background check (e.g., credit check, references, etc.)
    await asyncio.sleep(0.2)
    
    # Simple check logic (in real world, this would be more complex)
    check_passed = "spam" not in adopter_email and len(adopter_name) > 2
    check_result = "passed" if check_passed else "failed"
    check_reason = "All checks passed" if check_passed else "Failed basic validation"
    
    check_data = {
        "applicationId": application_id,
        "petId": pet_id,
        "petName": pet_name,
        "adopterName": adopter_name,
        "adopterEmail": adopter_email,
        "checkResult": check_result,
        "checkReason": check_reason,
        "checkedAt": int(time.time() * 1000)
    }
    
    # Log the check result
    if logger:
        logger.info("Background check completed", check_data)
    
    print(f"✅ Background check {check_result} for {adopter_name}")
    
    # Emit event to trigger decision
    if emit:
        await emit({
            "topic": "py.adoption.checked",
            "data": check_data
        })
    
    return {
        "success": True,
        "message": f"Background check {check_result}",
        "checkResult": check_result,
        "applicationId": application_id
    }