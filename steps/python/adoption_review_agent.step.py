# steps/python/adoption_review_agent.step.py
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

config = {
    "type": "api",
    "name": "PyAdoptionReviewAgent",
    "path": "/py/pets/:id/adoption-review",
    "method": "POST",
    "emits": ["py.adoption.needs_data", "py.adoption.ready"],
    "flows": ["PyPetManagement"]
}

# Emit Registry - Tools available to adoption review agent
ADOPTION_REVIEW_EMITS = [
    {
        "id": "emit.adoption.needs_data",
        "topic": "py.adoption.needs_data",
        "description": "Pet needs additional data/documentation before being available for adoption",
        "orchestratorEffect": "add needs_data flag (blocks available status)",
        "guards": ["must_be_healthy"]
    },
    {
        "id": "emit.adoption.ready",
        "topic": "py.adoption.ready",
        "description": "Pet is ready and suitable for adoption",
        "orchestratorEffect": "healthy → available (if no blocking flags)",
        "guards": ["must_be_healthy", "no_needs_data_flag"]
    }
]

def build_agent_context(pet):
    return {
        "petId": pet["id"],
        "species": pet["species"],
        "ageMonths": pet["ageMonths"],
        "weightKg": pet.get("weightKg"),
        "symptoms": pet.get("symptoms", []),
        "flags": pet.get("flags", []),
        "profile": pet.get("profile"),
        "currentStatus": pet["status"]
    }

async def call_agent_decision(agent_type, context, available_emits, logger):
    import json
    import urllib.request
    import urllib.parse
    import urllib.error
    
    artifact = {
        "petId": context["petId"],
        "agentType": agent_type,
        "timestamp": int(time.time() * 1000),
        "inputs": context,
        "availableEmits": available_emits,
        "modelOutput": "",
        "parsedDecision": {"chosenEmit": "", "rationale": ""},
        "success": False
    }

    try:
        if logger:
            logger.info('🔍 Agent decision starting', {"petId": context["petId"], "agentType": agent_type})
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise Exception('OPENAI_API_KEY environment variable is not set')

        if logger:
            logger.info('🔑 API key found, building prompt', {"petId": context["petId"]})

        # Build prompt
        emit_options = '\n'.join([
            f"- {emit['id']}: {emit['description']} (Effect: {emit['orchestratorEffect']})"
            for emit in available_emits
        ])

        profile_summary = "none"
        if context.get('profile'):
            profile = context['profile']
            profile_summary = f"Bio: {profile.get('bio', 'none')}, Breed: {profile.get('breedGuess', 'unknown')}, Temperament: {', '.join(profile.get('temperamentTags', []))}"

        prompt = f"""You are conducting an adoption readiness review for a pet. Based on the pet's information and profile completeness, choose exactly one emit that best represents the appropriate adoption action.

Pet Information:
- ID: {context['petId']}
- Species: {context['species']}
- Age: {context['ageMonths']} months
- Weight: {context.get('weightKg', 'unknown')} kg
- Current Status: {context['currentStatus']}
- Symptoms: {', '.join(context.get('symptoms', [])) or 'none reported'}
- Flags: {', '.join(context.get('flags', [])) or 'none'}
- Profile: {profile_summary}

Available Emits:
{emit_options}

Consider:
- Is the pet's profile complete enough for potential adopters?
- Are there any missing details that would help with matching?
- Is the pet ready for adoption based on health and behavioral assessment?

You must respond with valid JSON in this exact format:
{{
  "chosenEmit": "emit.adoption.ready",
  "rationale": "Clear explanation of why this emit was chosen based on the pet's adoption readiness"
}}

Choose the emit that best matches the pet's adoption readiness."""

        if logger:
            logger.info('📝 Prompt built, calling OpenAI API', {
                "petId": context["petId"], 
                "promptLength": len(prompt)
            })

        # Call OpenAI API
        request_data = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a pet adoption specialist AI agent. You must choose exactly one emit from the provided options and provide clear rationale. Always respond with valid JSON only.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 300,
            'temperature': 0.3,
        }
        
        request_json = json.dumps(request_data).encode('utf-8')
        
        request = urllib.request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=request_json,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            }
        )
        
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                if response.status != 200:
                    error_text = response.read().decode('utf-8')
                    raise Exception(f'OpenAI API error: {response.status} {response.reason} - {error_text}')
                
                response_data = response.read().decode('utf-8')
                data = json.loads(response_data)
                ai_response = data.get('choices', [{}])[0].get('message', {}).get('content')

                if not ai_response:
                    raise Exception('No response from OpenAI API')
                    
                if logger:
                    logger.info('📡 OpenAI API response received', {
                        "petId": context["petId"],
                        "status": response.status
                    })
                    
        except urllib.error.HTTPError as e:
            error_text = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
            raise Exception(f'OpenAI API HTTP error: {e.code} {e.reason} - {error_text}')
        except urllib.error.URLError as e:
            raise Exception(f'OpenAI API URL error: {e.reason}')

        artifact["modelOutput"] = ai_response

        # Parse AI response
        try:
            decision = json.loads(ai_response)
            
            if not decision.get("chosenEmit") or not decision.get("rationale"):
                raise Exception('Invalid decision format: missing chosenEmit or rationale')

            # Validate chosen emit exists
            valid_emit = None
            for emit in available_emits:
                if emit["id"] == decision["chosenEmit"]:
                    valid_emit = emit
                    break
                    
            if not valid_emit:
                raise Exception(f'Invalid chosen emit: {decision["chosenEmit"]}')

            artifact["parsedDecision"] = {
                "chosenEmit": decision["chosenEmit"],
                "rationale": decision["rationale"]
            }
            artifact["success"] = True

            if logger:
                logger.info('🤖 Agent decision made', {
                    "petId": context["petId"],
                    "agentType": agent_type,
                    "chosenEmit": decision["chosenEmit"],
                    "rationale": decision["rationale"][:100] + "..."
                })

        except json.JSONDecodeError as parse_error:
            raise Exception(f'Failed to parse agent decision: {str(parse_error)}')

    except Exception as error:
        error_message = str(error)
        
        # Handle specific error types
        if 'timeout' in error_message.lower():
            error_message = 'OpenAI API request timed out after 30 seconds'
        elif '401' in error_message:
            error_message = 'Invalid OpenAI API key - check OPENAI_API_KEY environment variable'
        elif '429' in error_message:
            error_message = 'OpenAI API rate limit exceeded - please try again later'
        elif 'insufficient_quota' in error_message:
            error_message = 'OpenAI API quota exceeded - check your billing'
        
        artifact["error"] = error_message
        artifact["success"] = False

        if logger:
            logger.error('❌ Agent decision failed', {
                "petId": context["petId"],
                "agentType": agent_type,
                "error": error_message
            })

    return artifact

async def handler(req, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    pet_id = req.get("pathParams", {}).get("id")

    if not pet_id:
        return {"status": 400, "body": {"message": "Pet ID is required"}}

    # Get pet
    pet = pet_store.get(pet_id)
    if not pet:
        return {"status": 404, "body": {"message": "Pet not found"}}

    if logger:
        logger.info('🏠 Adoption Review Agent triggered', {
            "petId": pet_id,
            "currentStatus": pet["status"],
            "flags": pet.get("flags", [])
        })

    # Check if pet is in a valid state for adoption review
    if pet["status"] not in ["healthy", "available"]:
        return {
            "status": 400,
            "body": {
                "message": "Adoption review can only be performed on healthy or available pets",
                "currentStatus": pet["status"]
            }
        }

    # Build agent context
    agent_context = build_agent_context(pet)

    try:
        if logger:
            logger.info('🔍 Starting agent decision call', {"petId": pet_id, "agentContext": agent_context})
        
        # Call agent decision
        artifact = await call_agent_decision(
            'adoption-review',
            agent_context,
            ADOPTION_REVIEW_EMITS,
            logger
        )
        
        if logger:
            logger.info('✅ Agent decision call completed', {"petId": pet_id, "success": artifact["success"]})

        if not artifact["success"]:
            if logger:
                logger.warn('⚠️ Agent decision failed, but returning error response', {
                    "petId": pet_id,
                    "error": artifact["error"]
                })
            
            return {
                "status": 500,
                "body": {
                    "message": "Agent decision failed",
                    "error": artifact["error"],
                    "petId": pet_id,
                    "suggestion": "Check OpenAI API key and try again"
                }
            }

        # Find the chosen emit
        chosen_emit_def = None
        for emit_def in ADOPTION_REVIEW_EMITS:
            if emit_def["id"] == artifact["parsedDecision"]["chosenEmit"]:
                chosen_emit_def = emit_def
                break
                
        if not chosen_emit_def:
            return {
                "status": 500,
                "body": {
                    "message": "Invalid emit chosen by agent",
                    "chosenEmit": artifact["parsedDecision"]["chosenEmit"]
                }
            }

        # Fire the chosen emit
        if emit:
            await emit({
                "topic": chosen_emit_def["topic"],
                "data": {
                    "petId": pet_id,
                    "event": chosen_emit_def["id"].replace('emit.', ''),  # Convert "emit.adoption.ready" to "adoption.ready"
                    "agentDecision": artifact["parsedDecision"],
                    "timestamp": artifact["timestamp"],
                    "context": agent_context
                }
            })

            if logger:
                logger.info('✅ Adoption review emit fired', {
                    "petId": pet_id,
                    "chosenEmit": artifact["parsedDecision"]["chosenEmit"],
                    "topic": chosen_emit_def["topic"],
                    "rationale": artifact["parsedDecision"]["rationale"]
                })

        return {
            "status": 200,
            "body": {
                "message": "Adoption review completed",
                "petId": pet_id,
                "agentDecision": artifact["parsedDecision"],
                "emitFired": chosen_emit_def["topic"],
                "artifact": {
                    "timestamp": artifact["timestamp"],
                    "success": artifact["success"],
                    "availableEmits": [e["id"] for e in artifact["availableEmits"]]
                }
            }
        }

    except Exception as error:
        if logger:
            logger.error('❌ Adoption review agent error', {
                "petId": pet_id,
                "error": str(error)
            })

        return {
            "status": 500,
            "body": {
                "message": "Adoption review failed",
                "error": str(error),
                "petId": pet_id
            }
        }
