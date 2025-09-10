# steps/python/adoption_decision.step.py
import time

config = {
    "type": "event",
    "name": "PyAdoptionDecision",
    "subscribes": ["py.adoption.checked"],
    "emits": ["py.adoption.approved", "py.adoption.rejected"],
    "flows": ["pets"]
}

async def handler(event, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"success": False, "message": "Import error"}
    
    event_data = event.get("data", event)
    application_id = event_data.get("applicationId")
    pet_id = event_data.get("petId")
    pet_name = event_data.get("petName")
    adopter_name = event_data.get("adopterName")
    check_result = event_data.get("checkResult")
    check_reason = event_data.get("checkReason")
    
    if not application_id:
        print("❌ No application ID provided in adoption.checked event")
        return {"success": False, "message": "Missing application ID"}
    
    # Make decision based on background check
    approved = check_result == "passed"
    decision = "approved" if approved else "rejected"
    decision_reason = "Background check passed" if approved else f"Background check failed: {check_reason}"
    
    print(f"⚖️ Making adoption decision for {adopter_name}: {decision.upper()}")
    
    # Update pet status based on decision
    if approved:
        pet_store.update(pet_id, {"status": "adopted"})
    else:
        pet_store.update(pet_id, {"status": "available"})  # Make available again
    
    decision_data = {
        "applicationId": application_id,
        "petId": pet_id,
        "petName": pet_name,
        "adopterName": adopter_name,
        "decision": decision,
        "decisionReason": decision_reason,
        "decidedAt": int(time.time() * 1000)
    }
    
    # Log the decision
    if logger:
        logger.info(f"Adoption {decision}", decision_data)
    
    emoji = "🎉" if approved else "❌"
    print(f"{emoji} Adoption {decision} for {pet_name} → {adopter_name}")
    
    # Emit appropriate event based on decision
    if emit:
        event_topic = "py.adoption.approved" if approved else "py.adoption.rejected"
        await emit({
            "topic": event_topic,
            "data": decision_data
        })
    
    return {
        "success": True,
        "message": f"Adoption {decision}",
        "decision": decision,
        "applicationId": application_id,
        "petId": pet_id
    }