# steps/python/health_review_agent.step.py
import sys
import os
import time

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services import pet_store

config = {
    "type": "api",
    "name": "PyHealthReviewAgent",
    "path": "/py/pets/:id/health-review",
    "method": "POST",
    "emits": ["py.health.treatment_required", "py.health.no_treatment_needed"],
    "flows": ["PyPetManagement"]
}

# Emit Registry - Tools available to health review agent
HEALTH_REVIEW_EMITS = [
    {
        "id": "emit.health.treatment_required",
        "topic": "py.health.treatment_required",
        "description": "Pet requires medical treatment due to health concerns",
        "orchestratorEffect": "healthy → ill → under_treatment",
        "guards": ["must_be_healthy"]
    },
    {
        "id": "emit.health.no_treatment_needed",
        "topic": "py.health.no_treatment_needed", 
        "description": "Pet is healthy and requires no medical intervention",
        "orchestratorEffect": "stay healthy",
        "guards": ["must_be_healthy"]
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

        prompt = f"""You are conducting a health review for a pet. Based on the pet's information, choose exactly one emit that best represents the appropriate health action.

Pet Information:
- ID: {context['petId']}
- Species: {context['species']}
- Age: {context['ageMonths']} months
- Weight: {context.get('weightKg', 'unknown')} kg
- Current Status: {context['currentStatus']}
- Symptoms: {', '.join(context.get('symptoms', [])) or 'none reported'}
- Flags: {', '.join(context.get('flags', [])) or 'none'}

Available Emits:
{emit_options}

You must respond with valid JSON in this exact format:
{{
  "chosenEmit": "emit.health.treatment_required",
  "rationale": "Clear explanation of why this emit was chosen based on the pet's condition"
}}

Choose the emit that best matches the pet's health status and needs."""

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
                    'content': 'You are a veterinary and pet adoption specialist AI agent. You must choose exactly one emit from the provided options and provide clear rationale. Always respond with valid JSON only.'
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
        logger.info('🏥 Health Review Agent triggered', {
            "petId": pet_id,
            "currentStatus": pet["status"],
            "symptoms": pet.get("symptoms", [])
        })

    # Check if pet is in a valid state for health review
    if pet["status"] not in ["healthy", "in_quarantine"]:
        return {
            "status": 400,
            "body": {
                "message": "Health review can only be performed on healthy or quarantined pets",
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
            'health-review',
            agent_context,
            HEALTH_REVIEW_EMITS,
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
        for emit_def in HEALTH_REVIEW_EMITS:
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
                    "event": chosen_emit_def["id"].replace('emit.', ''),  # Convert "emit.health.treatment_required" to "health.treatment_required"
                    "agentDecision": artifact["parsedDecision"],
                    "timestamp": artifact["timestamp"],
                    "context": agent_context
                }
            })

            if logger:
                logger.info('✅ Health review emit fired', {
                    "petId": pet_id,
                    "chosenEmit": artifact["parsedDecision"]["chosenEmit"],
                    "topic": chosen_emit_def["topic"],
                    "rationale": artifact["parsedDecision"]["rationale"]
                })

        return {
            "status": 200,
            "body": {
                "message": "Health review completed",
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
            logger.error('❌ Health review agent error', {
                "petId": pet_id,
                "error": str(error)
            })

        return {
            "status": 500,
            "body": {
                "message": "Health review failed",
                "error": str(error),
                "petId": pet_id
            }
        }
