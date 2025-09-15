# Pet Store Adoption Workflow

A multi-language pet adoption management system built with Motia, demonstrating CRUD operations, event-driven workflows, and background processing across TypeScript, JavaScript, and Python implementations.

## Features

- **Multi-language Support**: Complete implementations in TypeScript, JavaScript, and Python
- **Pet Management**: Full CRUD operations for pet records
- **Adoption Workflow**: End-to-end adoption process with background checks and follow-up
- **Real-time Streaming**: Live workflow updates with Motia streams integration
- **Intelligent Recommendations**: AI-powered pet matching with natural language reasons
- **Generative Summaries**: Automated application summaries with optional OpenAI enhancement
- **Language-Specific Event Isolation**: Each language has its own event namespace preventing cross-interference
- **Background Jobs**: Automated daily feeding reminders
- **File-based Storage**: JSON persistence across all implementations

## Architecture

### Workflow Organization

The system uses separate workflow definitions in `motia-workbench.json` for better organization:

- `"typescript-adoptions"` - Complete TypeScript adoption workflow
- `"javascript-adoptions"` - Complete JavaScript adoption workflow  
- `"python-adoptions"` - Complete Python adoption workflow
- `"pets"` - Shared pet management operations (CRUD, recommendations, daily jobs)

Each workflow definition includes:
- **Step Positioning**: Visual layout in Motia Workbench
- **Event Flow**: Connection between steps via handle positions
- **Language Isolation**: Complete separation of adoption workflows
- **Shared Resources**: Pet management steps available to all languages

### Enhanced Adoption Workflow
The system now implements a sophisticated, non-linear workflow with AI agents and parallel processing:

1. **Application Submission** - Submit adoption application via API with comprehensive validation
2. **Parallel Processing** - Two processes run simultaneously:
   - **Background Check** - Validates adopter history and pet availability
   - **AI Summarization** - Generates intelligent application summary
3. **Workflow Gateway** - Decision engine with three paths:
   - **Approve** → Pet marked adopted, follow-up scheduled
   - **Reject** → Recommender agent suggests alternative pets
   - **Escalate** → Risk assessor evaluates confidence level
4. **AI Agents**:
   - **Application Summarizer** - Creates professional summaries
   - **Risk Assessor** - Evaluates adoption risk and confidence
   - **Recommender** - Suggests alternative pets with reasoning
5. **Automated Follow-up** - Cron jobs for:
   - 3-day check-in after adoption
   - 14-day wellness check
   - Stale application cleanup
6. **Real-time Streaming** - Live updates through all phases

### Language-Specific Workflow Isolation
Each language now has its own dedicated workflow in `motia-workbench.json`:

- **TypeScript**: `"typescript-adoptions"` workflow with `ts.adoption.*` events
- **JavaScript**: `"javascript-adoptions"` workflow with `js.adoption.*` events  
- **Python**: `"python-adoptions"` workflow with `py.adoption.*` events
- **General**: `"adoptions"` workflow for shared/legacy steps
- **Pet Management**: `"pets"` workflow for shared CRUD operations

**Complete Workflow Coverage:**
Each language now includes all workflow steps:
- API endpoint for application submission
- Parallel background check and AI summarization
- Workflow gateway for decision making (approve/reject/escalate)
- Post-decision actions (follow-up, recommendations, risk assessment)
- Automated cron jobs (TypeScript only for demonstration)

**Benefits:**
- Complete workflow isolation per language
- No cross-language event interference
- Each API endpoint triggers only its language-specific workflow
- Clean separation of concerns and easier debugging
- Individual workflow visualization in Motia Workbench
- Consistent workflow logic across all languages

## API Endpoints

### Pet Management (CRUD)

#### TypeScript Endpoints
```bash
# Create a pet
POST /ts/pets
# Get all pets
GET /ts/pets
# Get specific pet
GET /ts/pets/:id
# Update pet
PUT /ts/pets/:id
# Delete pet
DELETE /ts/pets/:id
```

#### JavaScript Endpoints
```bash
# Create a pet
POST /js/pets
# Get all pets
GET /js/pets
# Get specific pet
GET /js/pets/:id
# Update pet
PUT /js/pets/:id
# Delete pet
DELETE /js/pets/:id
```

#### Python Endpoints
```bash
# Create a pet
POST /py/pets
# Get all pets
GET /py/pets
# Get specific pet
GET /py/pets/:id
# Update pet
PUT /py/pets/:id
# Delete pet
DELETE /py/pets/:id
```

### Adoption Workflow

#### Application Submission
```bash
# TypeScript
POST /ts/adoptions/apply

# JavaScript  
POST /js/adoptions/apply

# Python
POST /py/adoptions/apply
```

#### Pet Recommendations
```bash
# TypeScript
POST /ts/recommendations

# JavaScript
POST /js/recommendations

# Python
POST /py/recommendations
```

## Real-Time Streaming

### Stream Integration
The adoption workflow includes real-time streaming capabilities:

- **Stream Definition**: `streams.json` defines the adoptions stream schema
- **Live Updates**: Each workflow step publishes stream updates with `traceId`
- **Workbench Integration**: API responses include stream records for live UI updates
- **Phase Tracking**: Stream updates show progression through workflow phases

### Stream Phases
1. `applied` - Initial adoption application submitted
2. `checking` - Background check and AI summarization running in parallel
3. `summary_ready` - Application summary generated and ready for decision
4. `approved` - Application approved, pet marked as adopted
5. `rejected` - Application rejected, recommender suggestions provided
6. `needs_human` - Escalated to human review due to risk assessment
7. `followup` - Follow-up check-ins scheduled or completed
8. `closed` - Application process completed and archived

## Testing Examples

### 1. Create Test Pets

**Note**: The system uses `ageMonths` internally but displays as years in responses.

#### TypeScript
```bash
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "ageMonths": 36
  }'
```

#### JavaScript
```bash
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Whiskers",
    "species": "cat",
    "breed": "Persian",
    "ageMonths": 24
  }'
```

#### Python
```bash
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "species": "dog",
    "breed": "Labrador",
    "ageMonths": 48
  }'
```

### 2. List All Pets

```bash
# TypeScript pets
curl http://localhost:3000/ts/pets

# JavaScript pets
curl http://localhost:3000/js/pets

# Python pets
curl http://localhost:3000/py/pets
```

### 3. Test Enhanced Adoption Workflow with AI Agents and Streaming

The new adoption workflow demonstrates:
- **Parallel Processing**: Background check and AI summarization run simultaneously
- **Workflow Branching**: Approve, reject, or escalate based on intelligent decision-making
- **AI Agents**: Risk assessment, recommendations, and application summarization
- **Language Isolation**: Each language has its own complete workflow
- **Cron Jobs**: Automated follow-up check-ins and cleanup
- **Real-time Streaming**: Live updates through all workflow phases

#### Complete Workflow Testing

**Required Fields for All Applications:**
All adoption applications now require these fields:
- `petId` - ID of the pet to adopt
- `adopterName` - Name of the adopter (minimum 3 characters)
- `adopterEmail` - Email address (will be validated)

#### Successful Adoption Flow (TypeScript)
```bash
# First, get a pet ID from the list above, then:
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "John Smith",
    "adopterEmail": "john@example.com"
  }'
```

**Expected Response:**
```json
{
  "status": 202,
  "body": {
    "entityId": "app-1234567890",
    "type": "application",
    "phase": "applied",
    "traceId": "trace-app-1234567890"
  }
}
```

**Watch for Console Output (Complete Workflow):**
- `📋 Adoption application received` - Application submitted
- `🔍 Running background check` - Parallel background validation
- `📝 Generating application summary` - Parallel AI summarization
- `⚖️ Processing workflow decision input` - Waiting for both processes
- `🎯 Making workflow decision - both processes complete` - Decision gateway
- `📧 Sending adoption follow-up` - Follow-up for approved applications

**Stream Phases You'll See:**
1. `applied` - Initial application
2. `checking` - Parallel processes running
3. `summary_ready` - AI summary complete
4. `approved` - Decision made
5. `followup` - Check-in scheduled

#### Rejected Application with Recommendations (JavaScript)
```bash
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "Spam User",
    "adopterEmail": "spam@example.com"
  }'
```

**Expected Enhanced Behavior:**
- Background check fails due to "spam" in email
- AI summary still generated in parallel
- Workflow gateway decides to reject
- **Recommender agent** automatically suggests alternative pets
- Stream shows `rejected` phase with recommendations
- Only JavaScript workflow steps execute (language isolation maintained)

**Watch for New Console Output:**
- `🤖 Generating pet recommendations after rejection`
- Alternative pet suggestions with AI-powered reasons

#### Escalation Flow - Risk Assessment (Python)
```bash
# Create a senior pet first to trigger escalation
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Max",
    "species": "dog",
    "breed": "Golden Retriever",
    "ageMonths": 132
  }'

# Then apply for adoption
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "3",
    "adopterName": "Alice Johnson",
    "adopterEmail": "alice@example.com"
  }'
```

**Expected Escalation Behavior:**
- Background check passes
- AI summary generated
- Workflow gateway detects senior pet (11+ years)
- **Escalates to risk assessment agent**
- Risk assessor evaluates confidence level
- If confidence < threshold → `needs_human` phase
- If confidence adequate → conditional approval

**Watch for Risk Assessment Output:**
- `🔍 Assessing adoption risk`
- Risk score calculation and confidence rating
- AI-enhanced assessment reasoning (if OpenAI key available)

#### Advanced Workflow Testing

**Test All Three Language Workflows:**
Each language now has a complete, isolated workflow. Test each one separately:

```bash
# TypeScript - Complete workflow with cron jobs
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "TypeScript User",
    "adopterEmail": "ts@example.com"
  }'

# JavaScript - Complete workflow 
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "2", 
    "adopterName": "JavaScript User",
    "adopterEmail": "js@example.com"
  }'

# Python - Complete workflow
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "3",
    "adopterName": "Python User", 
    "adopterEmail": "py@example.com"
  }'
```

**Verify Workflow Isolation:**
- Each language should trigger only its own workflow steps
- Check logs for language-specific prefixes: `Ts`, `Js`, `Py`
- Workbench should show three separate workflow executions
- No cross-language interference should occur

**Test Error Handling and Validation:**
```bash
# Missing required fields
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{"petId": "1"}'
# Expected: 400 Bad Request

# Short adopter name (triggers escalation)
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "Jo",
    "adopterEmail": "short@example.com"
  }'
# Expected: Background check fails, rejection with recommendations

# Spam email (triggers rejection)
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1", 
    "adopterName": "Spam User",
    "adopterEmail": "spam@example.com"
  }'
# Expected: Background check fails, triggers recommender agent
```

**Test Cron Job Simulation (TypeScript Only):**
The system includes three automated cron jobs:
- `TsAdoptionCheckinDay3` - 3-day follow-up (runs at 10 AM daily)
- `TsAdoptionCheckinDay14` - 14-day follow-up (runs at 2 PM daily)  
- `TsStaleApplicationCleanup` - Cleanup old applications (runs at 2 AM daily)

**Test AI Enhancement (Optional):**
Set your OpenAI API key to see enhanced AI features:
```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

With AI enabled, you'll get:
- More engaging recommendation reasons
- Professional application summaries
- Enhanced risk assessment explanations

**Workbench Testing:**
1. Open Motia Workbench
2. Navigate to each workflow: `"typescript-adoptions"`, `"javascript-adoptions"`, `"python-adoptions"`
3. Submit applications and watch real-time step execution
4. Verify each workflow runs independently
5. Check stream updates in the adoptions stream view

### 4. Test Pet Status Management

#### Valid Pet Status Values
```json
"available"  // Pet is available for adoption (default)
"pending"    // Pet has pending adoption application  
"adopted"    // Pet has been successfully adopted
```

#### Status Workflow Testing
```bash
# Make pet available for adoption
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "available"}'

# Mark pet as pending (simulates application submission)
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# Mark pet as adopted (simulates successful adoption)
curl -X PUT http://localhost:3000/py/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Verify status changes
curl http://localhost:3000/ts/pets/1
```

#### Update Multiple Pet Fields
```bash
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "species": "dog",
    "ageMonths": 24,
    "status": "available"
  }'
```

**Valid Species Values:** `"dog"`, `"cat"`, `"bird"`, `"other"`

### 5. Test Cross-Language Data Consistency

```bash
# Create pet via TypeScript
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Max", "species": "dog", "ageMonths": 60}'

# View same pet via JavaScript
curl http://localhost:3000/js/pets

# Update via Python
curl -X PUT http://localhost:3000/py/pets/2 \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# Verify update via TypeScript
curl http://localhost:3000/ts/pets/2
```

**Expected:** All languages share the same data store, so changes are visible across implementations.

### 6. Test Intelligent Pet Recommendations

#### Get Recommendations (TypeScript)
```bash
curl -X POST http://localhost:3000/ts/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "maxAge": 5,
    "breed": "Golden"
  }'
```

#### Get Recommendations (JavaScript)
```bash
curl -X POST http://localhost:3000/js/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "cat",
    "maxAge": 3
  }'
```

#### Get Recommendations (Python)
```bash
curl -X POST http://localhost:3000/py/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "minAge": 2,
    "maxAge": 6,
    "breed": "Labrador"
  }'
```

### 7. Test Streaming and Workbench Integration

#### Monitor Real-time Updates
1. **Open Motia Workbench** and navigate to the "adoptions" flow
2. **Submit an adoption application** using any of the above examples
3. **Watch the workflow diagram** for real-time step execution
4. **Check the Streams view** in workbench for live stream updates

#### Stream Data Structure
```json
{
  "entityId": "app-1234567890",
  "type": "application",
  "phase": "applied",
  "message": "Alice Johnson applied to adopt Charlie",
  "timestamp": 1234567890,
  "data": {
    "petId": "1",
    "petName": "Charlie",
    "adopterName": "Alice Johnson",
    "traceId": "trace-app-1234567890"
  }
}
```

### 8. Test Edge Cases

#### Missing Required Fields
```bash
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1"
  }'
# Expected: 400 Bad Request - Missing adopterName and adopterEmail
```

#### Non-existent Pet
```bash
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "invalid-pet-id",
    "adopterName": "Test User",
    "adopterEmail": "test@example.com"
  }'
# Expected: 404 Not Found
```

#### Pet Already Adopted
```bash
# First adopt a pet, then try to adopt the same pet again
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "Second Adopter",
    "adopterEmail": "second@example.com"
  }'
# Expected: 409 Conflict - Pet already adopted
```

## Background Jobs

### Daily Feeding Reminders
Automated cron jobs run daily to remind staff about pet feeding schedules:

- **TypeScript**: `jobs.feeding.daily.step.ts`
- **JavaScript**: `jobs.feeding.daily.step.js`  
- **Python**: `jobs_feeding_daily.step.py`

## Event Flow & Streaming

### Complete Adoption Process Events

1. **Application Submitted**
   - Events: `ts.adoption.applied` / `js.adoption.applied` / `py.adoption.applied`
   - Stream: `phase: 'applied'`

2. **Background Check Completed**
   - Events: `ts.adoption.checked` / `js.adoption.checked` / `py.adoption.checked`
   - Stream: `phase: 'checked'`

3. **Application Summary Generated**
   - Events: `ts.adoption.summary.ready` / `js.adoption.summary.ready` / `py.adoption.summary.ready`
   - Stream: `phase: 'summary_ready'`

4. **Decision Made**
   - Events: `ts.adoption.approved` / `js.adoption.approved` / `py.adoption.approved`
   - Stream: `phase: 'approved'` or `phase: 'rejected'`

5. **Follow-up Sent** (for approved adoptions only)
   - Triggered by approval events
   - Final step in workflow

### Language Isolation Benefits
- **No Cross-Interference**: Python API only triggers Python events
- **Independent Scaling**: Each language can be scaled separately  
- **Easier Debugging**: Clear separation of language-specific issues
- **Clean Architecture**: Each implementation is self-contained

## Data Storage

All implementations use file-based JSON storage:

- **TypeScript**: `steps/typescript/ts-store.ts`
- **JavaScript**: `steps/javascript/js-store.js`
- **Python**: `steps/services/pet_store.py`

Data is persisted in JSON files and shared across language implementations for consistency.

## Monitoring & Logging

Each step includes comprehensive logging:
- Application submissions
- Background check results
- Adoption decisions
- Follow-up notifications

Check console output and structured logs for workflow execution details.

## Workbench Visualization

### Separate Workflow Views
The Motia workbench now displays individual workflows defined in `motia-workbench.json`:

#### TypeScript Adoption Workflow (`"typescript-adoptions"`)
- **Complete Flow**: Apply → Parallel(Check + Summary) → Decision Gateway → Post-Decision Actions → Follow-up
- **Includes**: All TypeScript-specific adoption steps and cron jobs
- **Events**: `ts.adoption.*` event namespace
- **Steps**: 10 total steps including 3 automated cron jobs
- **Visual Layout**: Comprehensive left-to-right flow with all workflow phases

#### JavaScript Adoption Workflow (`"javascript-adoptions"`)
- **Complete Flow**: Apply → Parallel(Check + Summary) → Decision Gateway → Post-Decision Actions
- **Includes**: All JavaScript-specific adoption steps  
- **Events**: `js.adoption.*` event namespace
- **Steps**: 7 total steps covering complete adoption workflow
- **Visual Layout**: Clean workflow layout with parallel processing branches

#### Python Adoption Workflow (`"python-adoptions"`)
- **Complete Flow**: Apply → Parallel(Check + Summary) → Decision Gateway → Post-Decision Actions
- **Includes**: All Python-specific adoption steps
- **Events**: `py.adoption.*` event namespace
- **Steps**: 7 total steps covering complete adoption workflow
- **Visual Layout**: Consistent structure matching other language workflows

#### General Adoption Workflow (`"adoptions"`)
- **Legacy Support**: Contains some shared/legacy adoption steps
- **Events**: Mixed event namespaces
- **Purpose**: Maintains compatibility with existing configurations

#### Pet Management Workflow (`"pets"`)
- **CRUD Operations**: Create, read, update, delete pets across all languages
- **Recommendations**: AI-powered pet matching
- **Daily Maintenance**: Feeding reminder cron jobs
- **Visual Layout**: Shared operations available to all adoption workflows

### Real-time Features
- **Individual Workflow Execution**: Watch language-specific workflows in isolation
- **Stream Updates**: Monitor adoption progress via shared streams
- **Event Tracing**: Track events within each workflow boundary
- **Cross-Language Data**: Shared pet data store across all workflows

## AI Enhancement

### OpenAI Integration

Set the `OPENAI_API_KEY` environment variable to enable AI-powered features:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

**AI-Enhanced Features:**
- **Recommendation Reasons**: More engaging and personalized pet match explanations
- **Application Summaries**: Professional, friendly summaries of adoption applications

**Without API Key:**
- System uses deterministic, rule-based reasoning
- All functionality works normally with basic text generation

### Recommendation Algorithm

**Scoring System:**
- Species match: +40 points
- Age within range: +20 points each (min/max)
- Breed match: +15 points
- Available status: +5 points
- Maximum score: 100 points

**Preference Options:**
- `species`: "dog", "cat", etc.
- `maxAge`: Maximum age preference
- `minAge`: Minimum age preference  
- `breed`: Breed name (partial matching)

## Workflow Architecture & Testing

### Complete Workflow Coverage

Each language implementation now includes the full adoption workflow:

#### 1. **Application Phase**
- **API Endpoint**: Receives and validates adoption applications
- **Required Fields**: `petId`, `adopterName`, `adopterEmail`
- **Stream Creation**: Creates initial stream record with `applied` phase
- **Event Emission**: Triggers parallel processing

#### 2. **Parallel Processing Phase**
- **Background Check**: Validates adopter history, pet availability, email patterns
- **AI Summarization**: Generates intelligent application summaries
- **Synchronization**: Workflow gateway waits for both processes to complete
- **Stream Updates**: Shows `checking` phase during parallel execution

#### 3. **Decision Gateway Phase**
- **Three-Path Logic**: Approve, Reject, or Escalate
- **Decision Criteria**:
  - **Approve**: All checks pass, no risk factors detected
  - **Reject**: Background check fails, invalid data detected
  - **Escalate**: Senior pets, exotic species, concerning summary content
- **Random Escalation**: 10% chance for quality assurance demonstration

#### 4. **Post-Decision Actions**
- **Approved**: Pet marked adopted, follow-up scheduled, stream updated
- **Rejected**: Recommender agent suggests alternative pets
- **Escalated**: Risk assessor evaluates confidence level

#### 5. **Follow-up & Maintenance** (TypeScript Only)
- **3-Day Check-in**: Automated cron job for early adoption support
- **14-Day Check-in**: Wellness check and milestone verification
- **Cleanup Jobs**: Stale application management

### Testing Strategy

#### **Isolation Testing**
Test each language workflow independently:
```bash
# Each should trigger only its own language-specific steps
curl -X POST http://localhost:3000/ts/adoptions/apply -d '{"petId":"1","adopterName":"TS Test","adopterEmail":"ts@test.com"}'
curl -X POST http://localhost:3000/js/adoptions/apply -d '{"petId":"2","adopterName":"JS Test","adopterEmail":"js@test.com"}'
curl -X POST http://localhost:3000/py/adoptions/apply -d '{"petId":"3","adopterName":"PY Test","adopterEmail":"py@test.com"}'
```

#### **Parallel Processing Testing**
Watch logs to verify simultaneous execution:
- Background check and AI summarization should start at nearly the same time
- Decision gateway should wait for both to complete
- Look for "Waiting for parallel processes" message

#### **Decision Path Testing**
Force different decision paths:
```bash
# Force rejection with spam email
curl -X POST http://localhost:3000/js/adoptions/apply -d '{"petId":"1","adopterName":"Test","adopterEmail":"spam@test.com"}'

# Force escalation with short name  
curl -X POST http://localhost:3000/py/adoptions/apply -d '{"petId":"1","adopterName":"Jo","adopterEmail":"short@test.com"}'

# Normal approval path
curl -X POST http://localhost:3000/ts/adoptions/apply -d '{"petId":"1","adopterName":"John Smith","adopterEmail":"john@test.com"}'
```

#### **Stream Monitoring**
Monitor real-time stream updates:
1. Open Motia Workbench
2. Navigate to Streams view
3. Watch `adoptions` stream for phase progression
4. Verify consistent phase tracking across all languages

#### **Workbench Verification**
Visual workflow verification:
1. Each language should have its own workflow tab
2. Steps should execute in proper sequence
3. Parallel steps should show simultaneous execution
4. Decision gateway should show branching logic
5. No cross-language step execution

## Troubleshooting

### Common Issues

1. **Pet not found**: Ensure you're using a valid pet ID from the GET /pets response
2. **Import errors**: Check that all service files are properly structured
3. **Event not triggering**: Verify that event names match between emitters and subscribers
4. **Cross-language interference**: Each language uses isolated event namespaces
5. **AI features not working**: Verify OPENAI_API_KEY is set correctly

### Validation Rules

#### Pet Data Validation
- **Pet names**: Must be non-empty strings
- **Pet species**: Must be one of: `"dog"`, `"cat"`, `"bird"`, `"other"`
- **Pet age**: `ageMonths` must be a positive number
- **Pet status**: Must be one of: `"available"`, `"pending"`, `"adopted"`

#### Adoption Validation
- **Adopter names**: Must be longer than 2 characters
- **Adopter emails**: Cannot contain "spam"
- **Pet availability**: Pet status must be "available" to start adoption process
- **Recommendations**: At least one preference must be provided

#### API Behavior
- ✅ Invalid field values are ignored (not applied to pet)
- ✅ Only valid fields are updated
- ✅ Returns 404 if pet ID doesn't exist
- ✅ Returns 200 with updated pet data on success

## Development

To extend the system:
1. Add new steps with proper `flows: ['pets']` configuration
2. Use language-specific event names to maintain isolation
3. Include comprehensive error handling and logging
4. Update workbench positioning for new steps

## License

This is a demonstration project for Motia workflow capabilities.