# steps/python/adoption_summary.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
from agent import PetRecommendationAgent
import time

config = {
    "type": "event",
    "name": "PyApplicationSummarizer",
    "description": "AI agent that summarizes application text in parallel with background check",
    "subscribes": ["py.adoption.applied"],
    "emits": ["py.adoption.summary.complete"],
    "flows": ["python-adoptions"]
}

async def handler(event, ctx=None):
    if not ctx:
        return
        
    application_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    adopter_name = (event or {}).get("adopterName")
    adopter_email = (event or {}).get("adopterEmail")
    
    ctx.logger.info("📝 Generating application summary", {
        "applicationId": application_id,
        "petId": pet_id,
        "adopterName": adopter_name
    })

    try:
        # Get pet information for context
        pet = pet_store.get(pet_id)
        pet_name = pet.get("name", "Unknown Pet") if pet else "Unknown Pet"
        pet_species = pet.get("species", "unknown") if pet else "unknown"

        # Create application data for AI summarization
        application_data = {
            "applicationId": application_id,
            "petName": pet_name,
            "petSpecies": pet_species,
            "adopterName": adopter_name or "Unknown Adopter",
            "adopterEmail": adopter_email or "No email provided",
            "checkResult": "pending"  # Will be updated when background check completes
        }

        # Generate AI-powered summary
        summary = await PetRecommendationAgent.generate_application_summary(application_data)

        ctx.logger.info("Application summary generated", {
            "applicationId": application_id,
            "petId": pet_id,
            "summary": summary[:100] + "..." if len(summary) > 100 else summary
        })

        # Update stream with summary
        # Summary generated - no stream update needed

        # Emit completion event with summary
        await ctx.emit({
            "topic": "py.adoption.summary.complete",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "petName": pet_name,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "summary": summary
            }
        })

    except Exception as error:
        ctx.logger.error("Application summary generation failed", {
            "applicationId": application_id,
            "petId": pet_id,
            "error": str(error)
        })

        # Fallback summary
        fallback_summary = f"Application {application_id} for {adopter_name or 'adopter'} requires review."

        await ctx.emit({
            "topic": "py.adoption.summary.complete",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "summary": fallback_summary,
                "error": str(error)
            }
        })
