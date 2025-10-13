# steps/python/ai_profile_enrichment.step.py
import json
import os
import asyncio
import urllib.request
import urllib.parse
import urllib.error
import time

config = {
    "type": "event",
    "name": "PyAiProfileEnrichment",
    "description": "AI agent that enriches pet profiles using OpenAI",
    "subscribes": ["py.pet.created"],
    "emits": [],
    "flows": ["PyPetManagement"]
}

async def handler(input_data, ctx=None):
    logger = getattr(ctx, 'logger', None) if ctx else None
    emit = getattr(ctx, 'emit', None) if ctx else None
    streams = getattr(ctx, 'streams', None) if ctx else None
    trace_id = getattr(ctx, 'traceId', None) if ctx else None
    
    pet_id = input_data.get('petId')
    name = input_data.get('name')
    species = input_data.get('species')

    if logger:
        logger.info('🤖 AI Profile Enrichment started', {'petId': pet_id, 'name': name, 'species': species})

    # Stream enrichment started event
    if streams and streams.petCreation and trace_id:
        await streams.petCreation.set(trace_id, 'enrichment_started', { 
            'message': f'AI enrichment started for {name}'
        })

    try:
        # Import pet store
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store

        # Get OpenAI API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise Exception('OPENAI_API_KEY environment variable is not set')

        # Create AI prompt for pet profile generation
        prompt = f"""Generate a pet profile for adoption purposes. Pet details:
- Name: {name}
- Species: {species}

Please provide a JSON response with these fields:
- bio: A warm, engaging 2-3 sentence description that would appeal to potential adopters
- breedGuess: Your best guess at the breed or breed mix (be specific but realistic)
- temperamentTags: An array of 3-5 personality traits (e.g., "friendly", "energetic", "calm")
- adopterHints: Practical advice for potential adopters (family type, living situation, care needs)

Keep it positive, realistic, and adoption-focused."""

        # Call OpenAI API using urllib
        request_data = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a pet adoption specialist who creates compelling, accurate pet profiles. Always respond with valid JSON only.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 500,
            'temperature': 0.7,
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
            with urllib.request.urlopen(request) as response:
                if response.status != 200:
                    raise Exception(f'OpenAI API error: {response.status} {response.reason}')
                
                response_data = response.read().decode('utf-8')
                data = json.loads(response_data)
                ai_response = data.get('choices', [{}])[0].get('message', {}).get('content')

                if not ai_response:
                    raise Exception('No response from OpenAI API')
        except urllib.error.HTTPError as e:
            raise Exception(f'OpenAI API HTTP error: {e.code} {e.reason}')
        except urllib.error.URLError as e:
            raise Exception(f'OpenAI API URL error: {e.reason}')

        # Parse AI response
        try:
            profile = json.loads(ai_response)
        except json.JSONDecodeError as parse_error:
            # Fallback profile if AI response is not valid JSON
            profile = {
                'bio': f'{name} is a wonderful {species} looking for a loving home. This pet has a unique personality and would make a great companion.',
                'breedGuess': 'Mixed Breed' if species == 'dog' else 'Domestic Shorthair' if species == 'cat' else 'Mixed Breed',
                'temperamentTags': ['friendly', 'loving', 'loyal'],
                'adopterHints': f'{name} would do well in a caring home with patience and love.'
            }
            
            if logger:
                logger.warn('⚠️ AI response parsing failed, using fallback profile', {'petId': pet_id, 'parseError': str(parse_error)})

        # Update pet with AI-generated profile
        updated_pet = pet_store.update_profile(pet_id, profile)
        
        if not updated_pet:
            raise Exception(f'Pet not found: {pet_id}')

        if logger:
            logger.info('✅ AI Profile Enrichment completed', {
                'petId': pet_id,
                'profile': {
                    'bio': profile['bio'][:50] + '...',
                    'breedGuess': profile['breedGuess'],
                    'temperamentTags': profile['temperamentTags'],
                    'adopterHints': profile['adopterHints'][:50] + '...'
                }
            })

        # Stream each field as it's processed
        enrichment_fields = ['bio', 'breedGuess', 'temperamentTags', 'adopterHints']
        for field in enrichment_fields:
            await asyncio.sleep(0.3)
            
            value = profile.get(field)
            
            if streams and streams.petCreation and trace_id:
                await streams.petCreation.set(trace_id, f'progress_{field}', { 
                    'message': f'Generated {field} for {name}'
                })

        # Stream enrichment completed event
        if streams and streams.petCreation and trace_id:
            await streams.petCreation.set(trace_id, 'completed', { 
                'message': f'AI enrichment completed for {name}'
            })

    except Exception as error:
        if logger:
            logger.error('❌ AI Profile Enrichment failed', {
                'petId': pet_id,
                'error': str(error)
            })

        # Create fallback profile on error
        fallback_profile = {
            'bio': f'{name} is a lovely {species} with a unique personality, ready to find their forever home.',
            'breedGuess': 'Mixed Breed' if species == 'dog' else 'Domestic Shorthair' if species == 'cat' else 'Mixed Breed',
            'temperamentTags': ['friendly', 'adaptable'],
            'adopterHints': f'{name} is looking for a patient and loving family.'
        }

        # Still update with fallback profile
        try:
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
            from services import pet_store
            pet_store.update_profile(pet_id, fallback_profile)
        except:
            pass

        # Stream fallback profile completion
        if streams and streams.petCreation and trace_id:
            await streams.petCreation.set(trace_id, 'completed', { 
                'message': f'AI enrichment completed with fallback profile for {name}'
            })
