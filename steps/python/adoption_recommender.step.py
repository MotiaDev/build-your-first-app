# steps/python/adoption_recommender.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
from agent import PetRecommendationAgent
import time
from datetime import datetime

config = {
    "type": "event",
    "name": "PyRecommender",
    "description": "AI agent that suggests alternative pets when applications are rejected",
    "subscribes": ["py.adoption.rejected"],
    "emits": ["py.adoption.recommendations.sent"],
    "flows": ["python-adoptions"]
}

async def handler(event, ctx=None):
    if not ctx:
        return
        
    application_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    adopter_name = (event or {}).get("adopterName")
    adopter_email = (event or {}).get("adopterEmail")
    rejection_reason = (event or {}).get("rejectionReason")
    
    ctx.logger.info("🤖 Generating pet recommendations after rejection", {
        "applicationId": application_id,
        "petId": pet_id,
        "adopterName": adopter_name
    })

    try:
        # Get the original pet they applied for to understand preferences
        original_pet = pet_store.get(pet_id)
        original_pet_name = original_pet.get("name", "Unknown Pet") if original_pet else "Unknown Pet"

        # Infer preferences from the original pet choice
        inferred_preferences = {
            "species": original_pet.get("species", "dog") if original_pet else "dog",
            "maxAge": (original_pet.get("ageMonths", 60) // 12) + 2 if original_pet else 5,  # Similar age range
            "breed": original_pet.get("breed") if original_pet else None,
            "size": original_pet.get("size") if original_pet else None
        }

        # Remove None values
        inferred_preferences = {k: v for k, v in inferred_preferences.items() if v is not None}

        ctx.logger.info("Inferred preferences from original application", {
            "applicationId": application_id,
            "originalPet": original_pet_name,
            "preferences": inferred_preferences
        })

        # Get recommendations using the agent
        recommendations = await PetRecommendationAgent.get_recommendations(inferred_preferences, 3)

        # Generate personalized message
        recommendation_message = f"Hi {adopter_name or 'there'}! "
        
        if rejection_reason:
            recommendation_message += f"While your application for {original_pet_name} couldn't be approved ({rejection_reason}), "
        else:
            recommendation_message += f"While your application for {original_pet_name} couldn't be approved at this time, "

        if len(recommendations) > 0:
            species_text = inferred_preferences.get("species", "pet")
            plural_suffix = "s" if len(recommendations) > 1 else ""
            recommendation_message += f"we found {len(recommendations)} other wonderful {species_text}{plural_suffix} that might be perfect for you:"
        else:
            recommendation_message += "we encourage you to check back as new pets become available regularly."

        # Format recommendations
        formatted_recommendations = []
        for index, match in enumerate(recommendations):
            pet_data = match.get("pet", {})
            formatted_recommendations.append({
                "petId": pet_data.get("id"),
                "name": pet_data.get("name"),
                "species": pet_data.get("species"),
                "breed": pet_data.get("breed"),
                "age": pet_data.get("age"),
                "ageMonths": pet_data.get("ageMonths"),
                "status": pet_data.get("status"),
                "score": match.get("score"),
                "reason": match.get("reason"),
                "rank": index + 1
            })

        recommendation_data = {
            "applicationId": application_id,
            "originalPetId": pet_id,
            "originalPetName": original_pet_name,
            "adopterName": adopter_name,
            "adopterEmail": adopter_email,
            "rejectionReason": rejection_reason,
            "inferredPreferences": inferred_preferences,
            "recommendations": formatted_recommendations,
            "message": recommendation_message,
            "generatedAt": datetime.utcnow().isoformat()
        }

        ctx.logger.info("Pet recommendations generated", {
            "applicationId": application_id,
            "originalPet": original_pet_name,
            "recommendationCount": len(recommendations),
            "topScore": recommendations[0].get("score", 0) if len(recommendations) > 0 else 0
        })

        # Update stream with recommendations
        # Recommendations generated - no stream update needed

        # Emit recommendations
        await ctx.emit({
            "topic": "py.adoption.recommendations.sent",
            "data": {
                **recommendation_data
            }
        })

    except Exception as error:
        ctx.logger.error("Recommendation generation failed", {
            "applicationId": application_id,
            "petId": pet_id,
            "error": str(error)
        })

        # Emit error - still send a basic message
        fallback_message = f"Hi {adopter_name or 'there'}! While your application couldn't be approved this time, please don't give up. Check back regularly as new pets become available."

        await ctx.emit({
            "topic": "py.adoption.recommendations.sent",
            "data": {
                "applicationId": application_id,
                "originalPetId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "rejectionReason": rejection_reason,
                "recommendations": [],
                "message": fallback_message,
                "error": str(error),
                "generatedAt": datetime.utcnow().isoformat()
            }
        })
