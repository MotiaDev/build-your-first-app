// steps/javascript/agent.js

class PetRecommendationAgent {
  
  static scorePet(pet, preferences) {
    let score = 0;
    
    // Species match (high weight)
    if (preferences.species && pet.species === preferences.species) {
      score += 40;
    }
    
    // Age preferences
    if (preferences.maxAge && pet.age <= preferences.maxAge) {
      score += 20;
    }
    if (preferences.minAge && pet.age >= preferences.minAge) {
      score += 20;
    }
    
    // Breed match
    if (preferences.breed && pet.breed?.toLowerCase().includes(preferences.breed.toLowerCase())) {
      score += 15;
    }
    
    // Only available pets get base score
    if (pet.status === 'available') {
      score += 5;
    } else {
      score = 0; // Not available = no match
    }
    
    return Math.min(score, 100);
  }
  
  static generateReason(pet, preferences, score) {
    const reasons = [];
    
    if (preferences.species && pet.species === preferences.species) {
      reasons.push(`perfect ${pet.species} match`);
    }
    
    if (preferences.maxAge && pet.age <= preferences.maxAge) {
      reasons.push(`age ${pet.age} fits your preference`);
    }
    
    if (preferences.breed && pet.breed?.toLowerCase().includes(preferences.breed.toLowerCase())) {
      reasons.push(`${pet.breed} breed match`);
    }
    
    if (pet.status === 'available') {
      reasons.push('currently available');
    }
    
    if (reasons.length === 0) {
      return `${pet.name} might be a good companion`;
    }
    
    return `${pet.name} is great because: ${reasons.join(', ')}`;
  }
  
  static async refineReasonWithAI(reason, petName) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return reason; // Return original if no API key
    }
    
    try {
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
            content: `Make this pet adoption reason more friendly and engaging (keep it under 50 words): "${reason}"`
          }],
          max_tokens: 100,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || reason;
      }
    } catch (error) {
      console.log('AI refinement failed, using original reason');
    }
    
    return reason;
  }
  
  static async getRecommendations(preferences, limit = 3) {
    const { list } = require('./js-store');
    const allPets = list();
    const matches = [];
    
    for (const pet of allPets) {
      // Convert ageMonths to age in years for compatibility
      const petWithAge = {
        ...pet,
        age: Math.floor(pet.ageMonths / 12)
      };
      
      const score = this.scorePet(petWithAge, preferences);
      if (score > 0) {
        let reason = this.generateReason(petWithAge, preferences, score);
        
        // Optionally refine with AI
        reason = await this.refineReasonWithAI(reason, pet.name);
        
        matches.push({ pet: petWithAge, score, reason });
      }
    }
    
    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  static async generateApplicationSummary(applicationData) {
    const { petName, adopterName, checkResult } = applicationData;
    
    const baseSummary = `${adopterName} applied to adopt ${petName}. Background check: ${checkResult}.`;
    
    // Try to enhance with AI if available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return baseSummary;
    }
    
    try {
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
            content: `Create a friendly, professional summary for this pet adoption application (keep it under 40 words): "${baseSummary}"`
          }],
          max_tokens: 80,
          temperature: 0.6
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || baseSummary;
      }
    } catch (error) {
      console.log('AI summary generation failed, using basic summary');
    }
    
    return baseSummary;
  }
}

module.exports = { PetRecommendationAgent };