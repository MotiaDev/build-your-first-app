# steps/python/agent.py
import os
import json
from typing import Dict, List, Any, Optional

class PetRecommendationAgent:
    
    @staticmethod
    def score_pet(pet: Dict[str, Any], preferences: Dict[str, Any]) -> int:
        score = 0
        
        # Species match (high weight)
        if preferences.get('species') and pet.get('species') == preferences['species']:
            score += 40
        
        # Age preferences
        if preferences.get('maxAge') and pet.get('age', 0) <= preferences['maxAge']:
            score += 20
        if preferences.get('minAge') and pet.get('age', 0) >= preferences['minAge']:
            score += 20
        
        # Breed match
        if preferences.get('breed') and pet.get('breed'):
            if preferences['breed'].lower() in pet['breed'].lower():
                score += 15
        
        # Only available pets get base score
        if pet.get('status') == 'available':
            score += 5
        else:
            score = 0  # Not available = no match
        
        return min(score, 100)
    
    @staticmethod
    def generate_reason(pet: Dict[str, Any], preferences: Dict[str, Any], score: int) -> str:
        reasons = []
        
        if preferences.get('species') and pet.get('species') == preferences['species']:
            reasons.append(f"perfect {pet['species']} match")
        
        if preferences.get('maxAge') and pet.get('age', 0) <= preferences['maxAge']:
            reasons.append(f"age {pet['age']} fits your preference")
        
        if preferences.get('breed') and pet.get('breed'):
            if preferences['breed'].lower() in pet['breed'].lower():
                reasons.append(f"{pet['breed']} breed match")
        
        if pet.get('status') == 'available':
            reasons.append('currently available')
        
        if not reasons:
            return f"{pet['name']} might be a good companion"
        
        return f"{pet['name']} is great because: {', '.join(reasons)}"
    
    @staticmethod
    async def refine_reason_with_ai(reason: str, pet_name: str) -> str:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return reason  # Return original if no API key
        
        try:
            import aiohttp
            
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
                            'content': f'Make this pet adoption reason more friendly and engaging (keep it under 50 words): "{reason}"'
                        }],
                        'max_tokens': 100,
                        'temperature': 0.7
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data['choices'][0]['message']['content'].strip() or reason
        except Exception as e:
            print('AI refinement failed, using original reason')
        
        return reason
    
    @staticmethod
    async def get_recommendations(preferences: Dict[str, Any], limit: int = 3) -> List[Dict[str, Any]]:
        try:
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
            from services import pet_store
            
            all_pets = pet_store.list_all()
            matches = []
            
            for pet in all_pets:
                # Convert ageMonths to age in years for compatibility
                pet_with_age = {
                    **pet,
                    'age': pet['ageMonths'] // 12
                }
                
                score = PetRecommendationAgent.score_pet(pet_with_age, preferences)
                if score > 0:
                    reason = PetRecommendationAgent.generate_reason(pet_with_age, preferences, score)
                    
                    # Optionally refine with AI
                    reason = await PetRecommendationAgent.refine_reason_with_ai(reason, pet['name'])
                    
                    matches.append({
                        'pet': pet_with_age,
                        'score': score,
                        'reason': reason
                    })
            
            # Sort by score and return top matches
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches[:limit]
            
        except ImportError:
            return []
    
    @staticmethod
    async def generate_application_summary(application_data: Dict[str, Any]) -> str:
        pet_name = application_data.get('petName', 'Unknown Pet')
        adopter_name = application_data.get('adopterName', 'Unknown Adopter')
        check_result = application_data.get('checkResult', 'unknown')
        
        base_summary = f"{adopter_name} applied to adopt {pet_name}. Background check: {check_result}."
        
        # Try to enhance with AI if available
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return base_summary
        
        try:
            import aiohttp
            
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
                            'content': f'Create a friendly, professional summary for this pet adoption application (keep it under 40 words): "{base_summary}"'
                        }],
                        'max_tokens': 80,
                        'temperature': 0.6
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data['choices'][0]['message']['content'].strip() or base_summary
        except Exception as e:
            print('AI summary generation failed, using basic summary')
        
        return base_summary