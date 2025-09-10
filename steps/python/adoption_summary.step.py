# steps/python/adoption_summary.step.py
import time
from .agent import PetRecommendationAgent

config = {
    "type": "event",
    "name": "PyAdoptionSummary",
    "subscribes": ["py.adoption.checked"],
    "emits": ["py.adoption.summary.generated"],
    "flows": ["pets"]
}

async def handler(event, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    
    event_data = event.get("data", event)
    application_id = event_data.get("applicationId")
    pet_name = event_data.get("petName")
    adopter_name = event_data.get("adopterName")
    check_result = event_data.get("checkResult")
    check_reason = event_data.get("checkReason")
    
    if not application_id:
        print("❌ No application ID provided in adoption.checked event")
        return {"success": False, "message": "Missing application ID"}
    
    print(f"📝 Generating application summary for {adopter_name} → {pet_name}")
    
    try:
        # Generate intelligent summary using the agent
        summary = await PetRecommendationAgent.generate_application_summary({
            "petName": pet_name,
            "adopterName": adopter_name,
            "checkResult": check_result,
            "checkReason": check_reason,
            "applicationId": application_id
        })
        
        summary_data = {
            "applicationId": application_id,
            "petName": pet_name,
            "adopterName": adopter_name,
            "checkResult": check_result,
            "summary": summary,
            "generatedAt": int(time.time() * 1000)
        }
        
        # Log the generated summary
        if logger:
            logger.info("Application summary generated", summary_data)
        
        print(f"✨ Summary: \"{summary}\"")
        
        # Emit summary generated event
        if emit:
            await emit({
                "topic": "py.adoption.summary.generated",
                "data": summary_data
            })
        
        return {
            "success": True,
            "message": "Application summary generated",
            "summary": summary,
            "applicationId": application_id
        }
        
    except Exception as error:
        print(f"❌ Failed to generate summary: {str(error)}")
        if logger:
            logger.error("Summary generation failed", {"error": str(error), "applicationId": application_id})
        
        return {
            "success": False,
            "message": "Failed to generate summary",
            "applicationId": application_id
        }