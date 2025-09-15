# steps/python/adoption_checkin_day3.cron.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
import asyncio
import time

config = {
    "type": "cron",
    "name": "PyAdoptionCheckinDay3",
    "description": "Runs 3 days after approval to check in on new adoptions",
    "cron": "0 10 * * *",  # Daily at 10 AM - in production would be more specific
    "emits": ["py.adoption.checkin.day3"],
    "flows": ["python-adoptions"]
}

async def handler(ctx=None):
    if not ctx:
        return
        
    ctx.logger.info("🗓️ Running 3-day adoption check-in job (Python)")

    try:
        # In a real system, this would query a database for adoptions from 3 days ago
        # For this demo, we'll simulate by checking recent adoptions
        all_pets = pet_store.list()
        adopted_pets = [pet for pet in all_pets if pet.get("status") == "adopted"]

        ctx.logger.info("Found adopted pets for potential check-in", {
            "adoptedCount": len(adopted_pets)
        })

        # Simulate checking adoptions from 3 days ago
        # In production, you'd have adoption records with timestamps
        for pet in adopted_pets[:2]:  # Limit to first 2 for demo
            checkin_data = {
                "petId": pet.get("id"),
                "petName": pet.get("name"),
                "petSpecies": pet.get("species"),
                "checkinType": "day3",
                "checkinDate": time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "message": f"3-day check-in for {pet.get('name')} - How is your new {pet.get('species')} settling in?",
                "recommendations": [
                    "Ensure consistent feeding schedule",
                    "Monitor stress levels and behavior", 
                    "Schedule vet check-up if not done already",
                    "Contact us with any concerns"
                ]
            }

            ctx.logger.info("Sending 3-day check-in", {
                "petId": pet.get("id"),
                "petName": pet.get("name")
            })

            # Emit check-in event
            if hasattr(ctx, 'emit'):
                await ctx.emit({
                    "topic": "py.adoption.checkin.day3",
                    "data": checkin_data
                })

            # Small delay to avoid overwhelming the system
            await asyncio.sleep(0.1)

        ctx.logger.info("3-day check-in job completed (Python)", {
            "processedCount": min(len(adopted_pets), 2)
        })

    except Exception as error:
        ctx.logger.error("3-day check-in job failed (Python)", {"error": str(error)})
