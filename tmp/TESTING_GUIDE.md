# Agent Testing Guide

This guide walks you through testing the new intelligent recommendation agent and generative workflow features.

## Prerequisites

1. **Start your Motia server**
2. **Optional**: Set OpenAI API key for AI-enhanced features
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

## Step-by-Step Testing

### 1. Create Test Pets

First, let's create some pets with different characteristics to test the recommendation algorithm:

```bash
# Create a young dog
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "age": 2,
    "status": "available"
  }'

# Create an older cat
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Whiskers",
    "species": "cat",
    "breed": "Persian",
    "age": 5,
    "status": "available"
  }'

# Create a middle-aged dog
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "species": "dog",
    "breed": "Labrador",
    "age": 4,
    "status": "available"
  }'

# Create a young cat
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luna",
    "species": "cat",
    "breed": "Siamese",
    "age": 1,
    "status": "available"
  }'

# Create an adopted pet (should not appear in recommendations)
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "dog",
    "breed": "Beagle",
    "age": 3,
    "status": "adopted"
  }'
```

### 2. Test Basic Recommendations

#### Test 1: Dog Lover Preferences
```bash
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "maxAge": 5
  }'
```

**Expected Result:**
- Should return Buddy, Charlie (both dogs under 5)
- Should NOT return Max (adopted)
- Should NOT return cats
- Each match should have a score and reason

#### Test 2: Cat Lover with Age Preference
```bash
curl -X POST http://localhost:3000/js/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "cat",
    "maxAge": 3
  }'
```

**Expected Result:**
- Should return Luna (cat, age 1)
- Should NOT return Whiskers (age 5, over limit)
- Higher score for Luna due to species + age match

#### Test 3: Breed-Specific Search
```bash
curl -X POST http://localhost:3000/py/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "breed": "Golden",
    "maxAge": 4
  }'
```

**Expected Result:**
- Should return Buddy (Golden Retriever, age 2)
- Should include breed match in the reason

#### Test 4: No Preferences (Should Fail)
```bash
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Result:**
- Should return 400 error
- Message about providing preferences

### 3. Test Generative Workflow (Application Summaries)

Now let's test the automatic summary generation when applications are processed:

#### Test 1: Successful Application with Summary
```bash
# First, get a pet ID from your created pets
curl http://localhost:3000/ts/pets

# Use a pet ID from the response in the adoption application
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "PUT_ACTUAL_PET_ID_HERE",
    "adopterName": "Alice Johnson",
    "adopterEmail": "alice@example.com"
  }'
```

**What to Watch For:**
1. Application submitted successfully
2. Background check runs automatically
3. **NEW**: Summary generation step runs
4. Look for console output: `📝 Generating application summary...`
5. Look for: `✨ Summary: "..."`
6. Decision step runs
7. Follow-up step runs (if approved)

#### Test 2: Failed Application with Summary
```bash
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "PUT_ACTUAL_PET_ID_HERE",
    "adopterName": "Spam User",
    "adopterEmail": "spam@example.com"
  }'
```

**What to Watch For:**
1. Background check fails (spam email)
2. Summary still generates (even for failed checks)
3. Application gets rejected
4. No follow-up step (rejected applications)

### 4. Test AI Enhancement (If OPENAI_API_KEY is Set)

#### Compare AI vs Non-AI Responses

**Without API Key:**
```bash
# Unset the API key temporarily
unset OPENAI_API_KEY

# Test recommendations
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "breed": "Golden"
  }'
```

**With API Key:**
```bash
# Set the API key
export OPENAI_API_KEY=your_api_key_here

# Test the same request
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "breed": "Golden"
  }'
```

**Expected Differences:**
- Without API: Basic, structured reasons
- With API: More natural, engaging language
- Both should work correctly

### 5. Test Cross-Language Consistency

Test that each language implementation works correctly:

```bash
# TypeScript recommendations
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{"species": "cat"}'

# JavaScript recommendations  
curl -X POST http://localhost:3000/js/recommendations \
  -H "Content-Type: application/json" \
  -d '{"species": "cat"}'

# Python recommendations
curl -X POST http://localhost:3000/py/recommendations \
  -H "Content-Type: application/json" \
  -d '{"species": "cat"}'
```

**Expected Result:**
- All three should return similar results
- Same pets should be recommended
- Scores should be consistent
- Reasons should be similar (unless AI varies them)

### 6. Test Edge Cases

#### Test 1: No Matching Pets
```bash
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "bird",
    "maxAge": 1
  }'
```

**Expected Result:**
- 200 status (not an error)
- Empty recommendations array
- Helpful message about no matches

#### Test 2: Very Restrictive Criteria
```bash
curl -X POST http://localhost:3000/js/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "maxAge": 1,
    "minAge": 10
  }'
```

**Expected Result:**
- No matches (impossible age range)
- Empty recommendations

### 7. Verify Workflow Integration

Check that the new steps appear in your Motia workbench:

1. Open the Motia workbench UI
2. Navigate to the "pets" workflow
3. You should see:
   - Recommendation API endpoints (separate from main flow)
   - Summary generation steps connected to the adoption.checked events
   - New event flows: `adoption.summary.generated`

### 8. Monitor Logs

Watch your server logs for:

```
📝 Generating application summary for [adopter] → [pet]
✨ Summary: "[generated summary]"
🔍 Running background check for [adopter]...
⚖️ Making adoption decision for [adopter]: APPROVED/REJECTED
```

## Troubleshooting

### Common Issues

1. **"No pets match your preferences"**
   - Check that you have available pets
   - Verify pet status is "available"
   - Try broader criteria

2. **Import errors in Python**
   - Ensure all agent files are in the correct directories
   - Check that the services directory exists

3. **AI features not working**
   - Verify OPENAI_API_KEY is set correctly
   - Check internet connection
   - Look for "AI refinement failed" messages (system falls back gracefully)

4. **Summary not generating**
   - Ensure the adoption.check step completes successfully
   - Check that the summary step is subscribed to the right events
   - Look for event emission in logs

### Success Indicators

✅ **Recommendations working**: Returns scored pet matches with reasons  
✅ **AI enhancement working**: More natural language in responses  
✅ **Summaries generating**: Console shows summary generation during adoption flow  
✅ **Cross-language consistency**: All three languages return similar results  
✅ **Event flow intact**: Existing adoption workflow still works  

## Next Steps

After testing, you can:

1. **Customize scoring**: Modify the scoring algorithm in agent files
2. **Add new preferences**: Extend the preference matching logic
3. **Enhance AI prompts**: Improve the OpenAI prompts for better responses
4. **Add more events**: Create additional generative workflow steps

The agent system is designed to be extensible and maintainable across all three language implementations!