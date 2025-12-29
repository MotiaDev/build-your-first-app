// steps/typescript/agent-decision-framework.ts
import { TSStore, Pet } from './ts-store';

export interface AgentEmit {
  id: string;
  topic: string;
  description: string;
  orchestratorEffect: string;
  guards?: string[];
}

export interface AgentContext {
  petId: string;
  species: string;
  ageMonths: number;
  weightKg?: number;
  symptoms?: string[];
  flags?: string[];
  profile?: any;
  currentStatus: string;
}

export interface AgentDecision {
  chosenEmit: string;
  rationale: string;
}

export interface AgentArtifact {
  petId: string;
  agentType: 'health-review' | 'adoption-review';
  timestamp: number;
  inputs: AgentContext;
  availableEmits: AgentEmit[];
  modelOutput: string;
  parsedDecision: AgentDecision;
  success: boolean;
  error?: string;
}

// Emit Registry - Tools available to agents
export const HEALTH_REVIEW_EMITS: AgentEmit[] = [
  {
    id: 'emit.health.treatment_required',
    topic: 'ts.health.treatment_required',
    description: 'Pet requires medical treatment due to health concerns',
    orchestratorEffect: 'healthy → ill → under_treatment',
    guards: ['must_be_healthy']
  },
  {
    id: 'emit.health.no_treatment_needed',
    topic: 'ts.health.no_treatment_needed', 
    description: 'Pet is healthy and requires no medical intervention',
    orchestratorEffect: 'stay healthy',
    guards: ['must_be_healthy']
  }
];

export const ADOPTION_REVIEW_EMITS: AgentEmit[] = [
  {
    id: 'emit.adoption.needs_data',
    topic: 'ts.adoption.needs_data',
    description: 'Pet needs additional data before being available for adoption',
    orchestratorEffect: 'add needs_data flag (blocks available)',
    guards: ['must_be_healthy']
  },
  {
    id: 'emit.adoption.ready',
    topic: 'ts.adoption.ready',
    description: 'Pet is ready for adoption and can be made available',
    orchestratorEffect: 'healthy → available (respect guards)',
    guards: ['must_be_healthy', 'no_needs_data_flag']
  }
];

// Agent artifact storage
const agentArtifacts: AgentArtifact[] = [];

export const storeAgentArtifact = (artifact: AgentArtifact): void => {
  agentArtifacts.push(artifact);
  
  // Keep only last 100 artifacts per pet to prevent memory bloat
  const petArtifacts = agentArtifacts.filter(a => a.petId === artifact.petId);
  if (petArtifacts.length > 100) {
    const toRemove = petArtifacts.slice(0, petArtifacts.length - 100);
    toRemove.forEach(old => {
      const index = agentArtifacts.indexOf(old);
      if (index > -1) agentArtifacts.splice(index, 1);
    });
  }
};

export const getAgentArtifacts = (petId: string): AgentArtifact[] => {
  return agentArtifacts.filter(a => a.petId === petId);
};

export const buildAgentContext = (pet: Pet): AgentContext => {
  return {
    petId: pet.id,
    species: pet.species,
    ageMonths: pet.ageMonths,
    weightKg: pet.weightKg,
    symptoms: pet.symptoms || [],
    flags: pet.flags || [],
    profile: pet.profile,
    currentStatus: pet.status
  };
};

export const callAgentDecision = async (
  agentType: 'health-review' | 'adoption-review',
  context: AgentContext,
  availableEmits: AgentEmit[],
  logger?: any
): Promise<AgentArtifact> => {
  const artifact: AgentArtifact = {
    petId: context.petId,
    agentType,
    timestamp: Date.now(),
    inputs: context,
    availableEmits,
    modelOutput: '',
    parsedDecision: { chosenEmit: '', rationale: '' },
    success: false
  };

  try {
    if (logger) {
      logger.info('🔍 Agent decision starting', { petId: context.petId, agentType });
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    if (logger) {
      logger.info('🔑 API key found, building prompt', { petId: context.petId });
    }

    // Build prompt based on agent type
    const prompt = buildAgentPrompt(agentType, context, availableEmits);
    
    if (logger) {
      logger.info('📝 Prompt built, calling OpenAI API', { 
        petId: context.petId, 
        promptLength: prompt.length 
      });
    }

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
            content: 'You are a veterinary and pet adoption specialist AI agent. You must choose exactly one emit from the provided options and provide clear rationale. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (logger) {
      logger.info('📡 OpenAI API response received', { 
        petId: context.petId, 
        status: response.status,
        ok: response.ok
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (logger) {
        logger.error('❌ OpenAI API error response', { 
          petId: context.petId, 
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
      }
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }

    artifact.modelOutput = aiResponse;

    // Parse AI response
    try {
      const decision = JSON.parse(aiResponse);
      
      if (!decision.chosenEmit || !decision.rationale) {
        throw new Error('Invalid decision format: missing chosenEmit or rationale');
      }

      // Validate chosen emit exists
      const validEmit = availableEmits.find(e => e.id === decision.chosenEmit);
      if (!validEmit) {
        throw new Error(`Invalid chosen emit: ${decision.chosenEmit}`);
      }

      artifact.parsedDecision = {
        chosenEmit: decision.chosenEmit,
        rationale: decision.rationale
      };
      artifact.success = true;

      if (logger) {
        logger.info(`🤖 Agent decision made`, {
          petId: context.petId,
          agentType,
          chosenEmit: decision.chosenEmit,
          rationale: decision.rationale.substring(0, 100) + '...'
        });
      }

    } catch (parseError: any) {
      throw new Error(`Failed to parse agent decision: ${parseError.message}`);
    }

  } catch (error: any) {
    let errorMessage = error.message;
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      errorMessage = 'OpenAI API request timed out after 30 seconds';
    } else if (error.message.includes('401')) {
      errorMessage = 'Invalid OpenAI API key - check OPENAI_API_KEY environment variable';
    } else if (error.message.includes('429')) {
      errorMessage = 'OpenAI API rate limit exceeded - please try again later';
    } else if (error.message.includes('insufficient_quota')) {
      errorMessage = 'OpenAI API quota exceeded - check your billing';
    }
    
    artifact.error = errorMessage;
    artifact.success = false;

    if (logger) {
      logger.error(`❌ Agent decision failed`, {
        petId: context.petId,
        agentType,
        error: errorMessage,
        originalError: error.message
      });
    }
  }

  storeAgentArtifact(artifact);
  return artifact;
};

const buildAgentPrompt = (
  agentType: 'health-review' | 'adoption-review',
  context: AgentContext,
  availableEmits: AgentEmit[]
): string => {
  const emitOptions = availableEmits.map(emit => 
    `- ${emit.id}: ${emit.description} (Effect: ${emit.orchestratorEffect})`
  ).join('\n');

  if (agentType === 'health-review') {
    return `You are conducting a health review for a pet. Based on the pet's information, choose exactly one emit that best represents the appropriate health action.

Pet Information:
- ID: ${context.petId}
- Species: ${context.species}
- Age: ${context.ageMonths} months
- Weight: ${context.weightKg || 'unknown'} kg
- Current Status: ${context.currentStatus}
- Symptoms: ${context.symptoms?.join(', ') || 'none reported'}
- Flags: ${context.flags?.join(', ') || 'none'}

Available Emits:
${emitOptions}

You must respond with valid JSON in this exact format:
{
  "chosenEmit": "emit.health.treatment_required",
  "rationale": "Clear explanation of why this emit was chosen based on the pet's condition"
}

Choose the emit that best matches the pet's health status and needs.`;
  } else {
    return `You are conducting an adoption readiness review for a pet. Based on the pet's information and profile completeness, choose exactly one emit that best represents the appropriate adoption action.

Pet Information:
- ID: ${context.petId}
- Species: ${context.species}
- Age: ${context.ageMonths} months
- Weight: ${context.weightKg || 'unknown'} kg
- Current Status: ${context.currentStatus}
- Flags: ${context.flags?.join(', ') || 'none'}
- Profile Complete: ${context.profile ? 'yes' : 'no'}
- Profile Bio: ${context.profile?.bio ? 'present' : 'missing'}
- Breed Guess: ${context.profile?.breedGuess || 'missing'}
- Temperament Tags: ${context.profile?.temperamentTags?.join(', ') || 'missing'}

Available Emits:
${emitOptions}

You must respond with valid JSON in this exact format:
{
  "chosenEmit": "emit.adoption.ready",
  "rationale": "Clear explanation of why this emit was chosen based on the pet's adoption readiness"
}

Choose the emit that best matches the pet's adoption readiness and data completeness.`;
  }
};
