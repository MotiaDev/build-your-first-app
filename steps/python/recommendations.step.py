# steps/python/recommendations.step.py
from .agent import PetRecommendationAgent

config = {
    "type": "api",
    "name": "PyRecommendations",
    "path": "/py/recommendations",
    "method": "POST",
    "emits": [],
    "flows": ["pets"]
}

async def handler(req, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    preferences = req.get("body", {})

    # Validate preferences
    if not preferences or len(preferences) == 0:
        return {
            "status": 400,
            "body": {"message": "Please provide adoption preferences (species, age, breed, etc.)"}
        }

    try:
        recommendations = await PetRecommendationAgent.get_recommendations(preferences, 5)

        if len(recommendations) == 0:
            return {
                "status": 200,
                "body": {
                    "message": "No pets match your preferences right now",
                    "recommendations": [],
                    "preferences": preferences
                }
            }

        if logger:
            logger.info("Generated pet recommendations", {
                "preferencesCount": len(preferences),
                "matchCount": len(recommendations)
            })

        return {
            "status": 200,
            "body": {
                "message": f"Found {len(recommendations)} great matches for you!",
                "recommendations": [
                    {
                        "pet": {
                            "id": match["pet"]["id"],
                            "name": match["pet"]["name"],
                            "species": match["pet"]["species"],
                            "breed": match["pet"]["breed"],
                            "age": match["pet"]["age"],
                            "status": match["pet"]["status"]
                        },
                        "score": match["score"],
                        "reason": match["reason"]
                    }
                    for match in recommendations
                ],
                "preferences": preferences
            }
        }

    except Exception as error:
        if logger:
            logger.error("Failed to generate recommendations", {"error": str(error)})
        return {
            "status": 500,
            "body": {"message": "Failed to generate recommendations"}
        }