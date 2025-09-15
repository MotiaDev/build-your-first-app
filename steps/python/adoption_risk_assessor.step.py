# steps/python/adoption_risk_assessor.step.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services import pet_store
import time
import random
from datetime import datetime

config = {
    "type": "event",
    "name": "PyRiskAssessor",
    "description": "AI agent that evaluates adoption risk and outputs confidence for escalation decisions",
    "subscribes": ["py.adoption.escalate"],
    "emits": ["py.adoption.risk.assessed"],
    "flows": ["python-adoptions"]
}

async def handler(event, ctx=None):
    if not ctx:
        return
        
    application_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    adopter_name = (event or {}).get("adopterName")
    adopter_email = (event or {}).get("adopterEmail")
    check_result = (event or {}).get("checkResult")
    check_details = (event or {}).get("checkDetails")
    summary = (event or {}).get("summary")
    
    ctx.logger.info("🔍 Assessing adoption risk", {
        "applicationId": application_id,
        "petId": pet_id,
        "adopterName": adopter_name
    })

    try:
        # Get pet information for context
        pet = pet_store.get(pet_id)
        pet_name = pet.get("name", "Unknown Pet") if pet else "Unknown Pet"
        pet_species = pet.get("species", "unknown") if pet else "unknown"
        pet_age = pet.get("ageMonths", 0) // 12 if pet else 0

        # Risk assessment algorithm
        risk_score = 0
        confidence = 100
        risk_factors = []
        recommendations = []

        # Analyze background check results
        if check_result == "failed":
            risk_score += 40
            risk_factors.append("Background check failed")
            recommendations.append("Require additional documentation")
        elif check_result == "error":
            risk_score += 20
            risk_factors.append("Background check incomplete")
            recommendations.append("Retry background verification")

        # Analyze adopter email patterns
        if adopter_email:
            if "temp" in adopter_email or "throwaway" in adopter_email:
                risk_score += 15
                risk_factors.append("Temporary email address detected")
            if "@" not in adopter_email or "." not in adopter_email:
                risk_score += 25
                risk_factors.append("Invalid email format")

        # Analyze pet characteristics for complexity
        if pet:
            if pet_age > 8:
                risk_score += 10
                risk_factors.append("Senior pet requires experienced adopter")
                recommendations.append("Verify experience with senior pets")
            if pet_species in ["bird", "exotic"]:
                risk_score += 15
                risk_factors.append("Exotic pet requires specialized care")
                recommendations.append("Verify specialized pet care knowledge")

        # Analyze summary for red flags
        if summary:
            lower_summary = summary.lower()
            if "concern" in lower_summary or "issue" in lower_summary:
                risk_score += 20
                risk_factors.append("Summary indicates concerns")
            if "first time" in lower_summary and "experienced" not in lower_summary:
                risk_score += 10
                risk_factors.append("First-time adopter")
                recommendations.append("Provide comprehensive adoption guidance")

        # Calculate confidence (inverse of risk, with some randomness for realism)
        confidence = max(10, 100 - risk_score - random.randint(0, 10))

        # Determine recommendation
        recommendation = "approve"
        reasoning = "Low risk adoption with good match potential"

        if risk_score > 50:
            recommendation = "needs_human"
            reasoning = "High risk factors detected, requires human review"
        elif risk_score > 25:
            recommendation = "conditional_approve"
            reasoning = "Moderate risk, approve with additional monitoring"

        # Generate AI-enhanced assessment if OpenAI is available
        enhanced_reasoning = reasoning
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                import aiohttp
                
                risk_context = f"Pet: {pet_name} ({pet_species}, {pet_age} years), Adopter: {adopter_name}, Risk Score: {risk_score}/100, Factors: {', '.join(risk_factors)}"
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        'https://api.openai.com/v1/chat/completions',
                        headers={
                            'Authorization': f'Bearer {api_key}',
                            'Content-Type': 'application/json',
                        },
                        json={
                            'model': 'gpt-3.5-turbo',
                            'messages': [{
                                'role': 'user',
                                'content': f'As a pet adoption risk assessor, provide a brief professional assessment (under 60 words) for this adoption: {risk_context}. Current recommendation: {recommendation}'
                            }],
                            'max_tokens': 120,
                            'temperature': 0.6
                        }
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            enhanced_reasoning = data['choices'][0]['message']['content'].strip() or reasoning
        except Exception as error:
            ctx.logger.warn("AI enhancement failed, using standard assessment", {"error": str(error)})

        assessment_result = {
            "applicationId": application_id,
            "petId": pet_id,
            "petName": pet_name,
            "adopterName": adopter_name,
            "riskScore": risk_score,
            "confidence": confidence,
            "recommendation": recommendation,
            "reasoning": enhanced_reasoning,
            "riskFactors": risk_factors,
            "recommendations": recommendations,
            "assessedAt": datetime.utcnow().isoformat()
        }

        ctx.logger.info("Risk assessment completed", {
            "applicationId": application_id,
            "petId": pet_id,
            "riskScore": risk_score,
            "confidence": confidence,
            "recommendation": recommendation,
            "factorCount": len(risk_factors)
        })

        # Update stream with risk assessment
        # Risk assessment completed - no stream update needed

        # Emit assessment result
        await ctx.emit({
            "topic": "py.adoption.risk.assessed",
            "data": {
                **assessment_result
            }
        })

    except Exception as error:
        ctx.logger.error("Risk assessment failed", {
            "applicationId": application_id,
            "petId": pet_id,
            "error": str(error)
        })

        # Emit error result - default to human review
        await ctx.emit({
            "topic": "py.adoption.risk.assessed",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "riskScore": 100,
                "confidence": 0,
                "recommendation": "needs_human",
                "reasoning": f"Risk assessment failed: {str(error)}",
                "riskFactors": ["Assessment system error"],
                "recommendations": ["Manual review required"],
                "error": str(error)
            }
        })
