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

### Complete Adoption Workflow
1. **Application Submission** - Submit adoption application via API with real-time stream creation
2. **Background Check** - Automated validation and verification with stream updates
3. **Summary Generation** - AI-powered application summary with stream status
4. **Decision Making** - Approve or reject based on check results with stream updates
5. **Follow-up Processing** - Send notifications for approved adoptions (final step)

### Language-Specific Event Isolation
- **TypeScript**: `ts.adoption.*` events (isolated workflow)
- **JavaScript**: `js.adoption.*` events (isolated workflow)
- **Python**: `py.adoption.*` events (isolated workflow)

**Benefits:**
- No cross-language event interference
- Each API endpoint triggers only its language-specific workflow
- Clean separation of concerns and easier debugging

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
1. `applied` - Application submitted
2. `checked` - Background check completed  
3. `summary_ready` - Application summary generated
4. `approved/rejected` - Decision made
5. `adopted` - Pet status updated (for approved applications)

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

### 3. Test Adoption Workflow with Streaming

#### Successful Adoption (TypeScript)
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

**Watch for Console Output:**
- `📡 Stream Created: trace-app-xxx → application app-xxx applied`
- `🔍 Running background check for John Smith...`
- `📝 Generating application summary...`
- `⚖️ Making adoption decision: APPROVED`
- `📧 Sending adoption follow-up for Buddy`

#### Failed Adoption (JavaScript - spam email)
```bash
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "Spam User",
    "adopterEmail": "spam@example.com"
  }'
```

**Expected Behavior:**
- Background check fails due to "spam" in email
- Application gets rejected
- No follow-up step executes
- Only JavaScript workflow steps execute (language isolation)

#### Language Isolation Test (Python)
```bash
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "1",
    "adopterName": "Alice Johnson",
    "adopterEmail": "alice@example.com"
  }'
```

**Verify Language Isolation:**
- Only Python workflow steps should execute
- No TypeScript or JavaScript steps should trigger
- Check logs for `PyAdoptionApply`, `PyAdoptionCheck`, etc.

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

### Adoptions Flow
The Motia workbench displays three parallel workflow lines in the "adoptions" flow:
- **Top line**: TypeScript adoption workflow
- **Middle line**: Python adoption workflow  
- **Bottom line**: JavaScript adoption workflow

**Complete Workflow:** Apply → Check → Summary → Decision → Followup

### Pets Flow  
Contains general pet management features:
- **Recommendations API**: Pet matching endpoints
- **Daily Jobs**: Feeding reminder cron jobs

### Real-time Features
- **Live Workflow Execution**: Watch steps execute in real-time
- **Stream Updates**: Monitor adoption progress via streams
- **Event Tracing**: Track events flowing through the system

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