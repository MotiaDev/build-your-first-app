# steps/python/adoption_check.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
import asyncio

config = {
    "type": "event",
    "name": "PyBackgroundCheck",
    "description": "Validates adopter history and pet availability in parallel with application summarizer",
    "subscribes": ["py.adoption.applied"],
    "emits": ["py.adoption.background.complete"],
    "flows": ["python-adoptions"]
}

async def handler(event, ctx=None):
    if not ctx:
        return
        
    application_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    adopter_name = (event or {}).get("adopterName")
    adopter_email = (event or {}).get("adopterEmail")
    
    ctx.logger.info("🔍 Running background check", {
        "applicationId": application_id,
        "petId": pet_id,
        "adopterName": adopter_name
    })

    # Update stream to show checking phase
    # Background check starting - no stream update needed

    # Simulate background check logic
    check_result = "passed"
    check_details = "All checks passed successfully"

    try:
        # Check pet availability
        pet = pet_store.get(pet_id)
        if not pet:
            check_result = "failed"
            check_details = "Pet not found"
        elif pet.get("status") != "available":
            check_result = "failed"
            check_details = "Pet is not available for adoption"

        # Check adopter email (simulate spam detection)
        if adopter_email and "spam" in adopter_email.lower():
            check_result = "failed"
            check_details = "Email flagged as potential spam"

        # Check adopter name (simulate basic validation)
        if adopter_name and len(adopter_name) < 3:
            check_result = "failed"
            check_details = "Adopter name too short"

        # Simulate processing delay
        await asyncio.sleep(0.5)

        ctx.logger.info("Background check completed", {
            "applicationId": application_id,
            "petId": pet_id,
            "checkResult": check_result,
            "checkDetails": check_details
        })

        # Emit completion event with check results
        await ctx.emit({
            "topic": "py.adoption.background.complete",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "checkResult": check_result,
                "checkDetails": check_details,
            }
        })

    except Exception as error:
        ctx.logger.error("Background check failed", {
            "applicationId": application_id,
            "petId": pet_id,
            "error": str(error)
        })
        
        await ctx.emit({
            "topic": "py.adoption.background.complete",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "checkResult": "error",
                "checkDetails": f"Check failed: {str(error)}",
            }
        })
