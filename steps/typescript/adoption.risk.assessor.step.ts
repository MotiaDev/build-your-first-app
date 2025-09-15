import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

const RiskAssessorInputSchema = z.object({
  applicationId: z.string(),
  petId: z.string(),
  adopterName: z.string().optional(),
  adopterEmail: z.string().optional(),
  checkResult: z.string(),
  checkDetails: z.string(),
  summary: z.string(),
  traceId: z.string()
});

export const config: EventConfig<typeof RiskAssessorInputSchema> = {
  type: 'event',
  name: 'TsRiskAssessor',
  description: 'AI agent that evaluates adoption risk and outputs confidence for escalation decisions',
  subscribes: ['ts.adoption.escalate'],
  emits: ['ts.adoption.risk.assessed'],
  input: RiskAssessorInputSchema,
  flows: ['typescript-adoptions'],
};

export const handler: Handlers['TsRiskAssessor'] = async (input, { emit, logger, streams, traceId }) => {
  const { applicationId, petId, adopterName, adopterEmail, checkResult, checkDetails, summary } = input;

  logger.info('🔍 Assessing adoption risk', { applicationId, petId, adopterName });

  try {
    // Get pet information for context
    const pet = TSStore.get(petId);
    const petName = pet ? pet.name : 'Unknown Pet';
    const petSpecies = pet ? pet.species : 'unknown';
    const petAge = pet ? Math.floor(pet.ageMonths / 12) : 0;

    // Risk assessment algorithm
    let riskScore = 0;
    let confidence = 100;
    let riskFactors = [];
    let recommendations = [];

    // Analyze background check results
    if (checkResult === 'failed') {
      riskScore += 40;
      riskFactors.push('Background check failed');
      recommendations.push('Require additional documentation');
    } else if (checkResult === 'error') {
      riskScore += 20;
      riskFactors.push('Background check incomplete');
      recommendations.push('Retry background verification');
    }

    // Analyze adopter email patterns
    if (adopterEmail) {
      if (adopterEmail.includes('temp') || adopterEmail.includes('throwaway')) {
        riskScore += 15;
        riskFactors.push('Temporary email address detected');
      }
      if (!adopterEmail.includes('@') || !adopterEmail.includes('.')) {
        riskScore += 25;
        riskFactors.push('Invalid email format');
      }
    }

    // Analyze pet characteristics for complexity
    if (pet) {
      if (petAge > 8) {
        riskScore += 10;
        riskFactors.push('Senior pet requires experienced adopter');
        recommendations.push('Verify experience with senior pets');
      }
      if (petSpecies === 'bird' || petSpecies === 'exotic') {
        riskScore += 15;
        riskFactors.push('Exotic pet requires specialized care');
        recommendations.push('Verify specialized pet care knowledge');
      }
    }

    // Analyze summary for red flags
    if (summary) {
      const lowerSummary = summary.toLowerCase();
      if (lowerSummary.includes('concern') || lowerSummary.includes('issue')) {
        riskScore += 20;
        riskFactors.push('Summary indicates concerns');
      }
      if (lowerSummary.includes('first time') && !lowerSummary.includes('experienced')) {
        riskScore += 10;
        riskFactors.push('First-time adopter');
        recommendations.push('Provide comprehensive adoption guidance');
      }
    }

    // Calculate confidence (inverse of risk, with some randomness for realism)
    confidence = Math.max(10, 100 - riskScore - Math.floor(Math.random() * 10));

    // Determine recommendation
    let recommendation = 'approve';
    let reasoning = 'Low risk adoption with good match potential';

    if (riskScore > 50) {
      recommendation = 'needs_human';
      reasoning = 'High risk factors detected, requires human review';
    } else if (riskScore > 25) {
      recommendation = 'conditional_approve';
      reasoning = 'Moderate risk, approve with additional monitoring';
    }

    // Generate AI-enhanced assessment if OpenAI is available
    let enhancedReasoning = reasoning;
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const riskContext = `Pet: ${petName} (${petSpecies}, ${petAge} years), Adopter: ${adopterName}, Risk Score: ${riskScore}/100, Factors: ${riskFactors.join(', ')}`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `As a pet adoption risk assessor, provide a brief professional assessment (under 60 words) for this adoption: ${riskContext}. Current recommendation: ${recommendation}`
            }],
            max_tokens: 120,
            temperature: 0.6
          })
        });

        if (response.ok) {
          const data = await response.json();
          enhancedReasoning = data.choices[0]?.message?.content?.trim() || reasoning;
        }
      }
    } catch (error) {
      logger.warn('AI enhancement failed, using standard assessment', { error: error.message });
    }

    const assessmentResult = {
      applicationId,
      petId,
      petName,
      adopterName,
      riskScore,
      confidence,
      recommendation,
      reasoning: enhancedReasoning,
      riskFactors,
      recommendations,
      assessedAt: new Date().toISOString()
    };

    logger.info('Risk assessment completed', {
      applicationId,
      petId,
      riskScore,
      confidence,
      recommendation,
      factorCount: riskFactors.length
    });

    // Update stream with risk assessment
    if (streams?.adoptions && traceId) {
      await streams.adoptions.set(traceId, 'risk_assessment', {
        entityId: applicationId,
        type: 'assessment',
        phase: 'risk_assessed',
        message: `Risk assessment: ${confidence}% confidence, ${recommendation}`,
        timestamp: Date.now(),
        data: assessmentResult
      });
    }

    // Emit assessment result
    await emit({
      topic: 'ts.adoption.risk.assessed',
      data: {
        ...assessmentResult,
        traceId
      }
    });

  } catch (error) {
    logger.error('Risk assessment failed', { 
      applicationId, 
      petId, 
      error: error.message 
    });

    // Emit error result - default to human review
    await emit({
      topic: 'ts.adoption.risk.assessed',
      data: {
        applicationId,
        petId,
        adopterName,
        riskScore: 100,
        confidence: 0,
        recommendation: 'needs_human',
        reasoning: `Risk assessment failed: ${error.message}`,
        riskFactors: ['Assessment system error'],
        recommendations: ['Manual review required'],
        error: error.message,
        traceId
      }
    });
  }
};
