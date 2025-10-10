// steps/javascript/ai-profile-enrichment.step.js
const { updateProfile } = require('./js-store');

exports.config = {
  type: 'event',
  name: 'JsAiProfileEnrichment',
  description: 'AI agent that enriches pet profiles using OpenAI',
  subscribes: ['js.pet.created'],
  emits: [],
  flows: ['JsPetManagement']
};

exports.handler = async (input, context) => {
  const { logger, streams, traceId } = context || {};
  const { petId, name, species } = input;

  if (logger) {
    logger.info('🤖 AI Profile Enrichment started', { petId, name, species });
  }

  // Stream enrichment started event
  if (streams && traceId) {
    await streams.petCreation.set(traceId, 'enrichment_started', { 
      message: `AI enrichment started for ${name}`
    });
  }

  // Profile enrichment started (no emit - no subscribers)

  try {
    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Create AI prompt for pet profile generation
    const prompt = `Generate a pet profile for adoption purposes. Pet details:
- Name: ${name}
- Species: ${species}

Please provide a JSON response with these fields:
- bio: A warm, engaging 2-3 sentence description that would appeal to potential adopters
- breedGuess: Your best guess at the breed or breed mix (be specific but realistic)
- temperamentTags: An array of 3-5 personality traits (e.g., "friendly", "energetic", "calm")
- adopterHints: Practical advice for potential adopters (family type, living situation, care needs)

Keep it positive, realistic, and adoption-focused.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a pet adoption specialist who creates compelling, accurate pet profiles. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }

    // Parse AI response
    let profile;
    try {
      profile = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback profile if AI response is not valid JSON
      profile = {
        bio: `${name} is a wonderful ${species} looking for a loving home. This pet has a unique personality and would make a great companion.`,
        breedGuess: species === 'dog' ? 'Mixed Breed' : species === 'cat' ? 'Domestic Shorthair' : 'Mixed Breed',
        temperamentTags: ['friendly', 'loving', 'loyal'],
        adopterHints: `${name} would do well in a caring home with patience and love.`
      };
      
      if (logger) {
        logger.warn('⚠️ AI response parsing failed, using fallback profile', { petId, parseError: parseError.message });
      }
    }

    // Update pet with AI-generated profile
    const updatedPet = updateProfile(petId, profile);
    
    if (!updatedPet) {
      throw new Error(`Pet not found: ${petId}`);
    }

    if (logger) {
      logger.info('✅ AI Profile Enrichment completed', { 
        petId, 
        profile: {
          bio: profile.bio.substring(0, 50) + '...',
          breedGuess: profile.breedGuess,
          temperamentTags: profile.temperamentTags,
          adopterHints: profile.adopterHints.substring(0, 50) + '...'
        }
      });
    }

    // Stream each field as it's processed
    const enrichmentFields = ['bio', 'breedGuess', 'temperamentTags', 'adopterHints'];
    for (const field of enrichmentFields) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const value = profile[field];
      
      if (streams && traceId) {
        await streams.petCreation.set(traceId, `progress_${field}`, { 
          message: `Generated ${field} for ${name}`
        });
      }
    }

    // Stream enrichment completed event
    if (streams && traceId) {
      await streams.petCreation.set(traceId, 'completed', { 
        message: `AI enrichment completed for ${name}`
      });
    }

    // Profile enrichment completed successfully (no emit - no subscribers)

  } catch (error) {
    if (logger) {
      logger.error('❌ AI Profile Enrichment failed', { 
        petId, 
        error: error.message 
      });
    }

    // Create fallback profile on error
    const fallbackProfile = {
      bio: `${name} is a lovely ${species} with a unique personality, ready to find their forever home.`,
      breedGuess: species === 'dog' ? 'Mixed Breed' : species === 'cat' ? 'Domestic Shorthair' : 'Mixed Breed',
      temperamentTags: ['friendly', 'adaptable'],
      adopterHints: `${name} is looking for a patient and loving family.`
    };

    // Still update with fallback profile
    updateProfile(petId, fallbackProfile);

    // Stream fallback profile completion
    if (streams && traceId) {
      await streams.petCreation.set(traceId, 'completed', { 
        message: `AI enrichment completed with fallback profile for ${name}`
      });
    }

    // Fallback profile created (no emit - no subscribers)
  }
};
