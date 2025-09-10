# Pet Store Adoption Workflow

A multi-language pet adoption management system built with Motia, demonstrating CRUD operations, event-driven workflows, and background processing across TypeScript, JavaScript, and Python implementations.

## Features

- **Multi-language Support**: Complete implementations in TypeScript, JavaScript, and Python
- **Pet Management**: Full CRUD operations for pet records
- **Adoption Workflow**: End-to-end adoption process with background checks
- **Intelligent Recommendations**: AI-powered pet matching with natural language reasons
- **Generative Summaries**: Automated application summaries with optional OpenAI enhancement
- **Event-driven Architecture**: Language-specific event isolation
- **Background Jobs**: Automated daily feeding reminders
- **File-based Storage**: JSON persistence across all implementations

## Architecture

### Workflow Steps
1. **Application Submission** - Submit adoption application via API
2. **Background Check** - Automated validation and verification
3. **Decision Making** - Approve or reject based on check results
4. **Follow-up Processing** - Send notifications for approved adoptions

### Language-Specific Events
- **TypeScript**: `ts.adoption.*` events
- **JavaScript**: `js.adoption.*` events  
- **Python**: `py.adoption.*` events

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

## Testing Examples

### 1. Create Test Pets

#### TypeScript
```bash
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "age": 3,
    "status": "available"
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
    "age": 2,
    "status": "available"
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
    "age": 4,
    "status": "available"
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

### 3. Test Adoption Workflow

#### Successful Adoption (TypeScript)
```bash
# First, get a pet ID from the list above, then:
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "pet-1234567890",
    "adopterName": "John Smith",
    "adopterEmail": "john@example.com"
  }'
```

#### Failed Adoption (JavaScript - spam email)
```bash
curl -X POST http://localhost:3000/js/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "pet-1234567890",
    "adopterName": "Spam User",
    "adopterEmail": "spam@example.com"
  }'
```

#### Successful Adoption (Python)
```bash
curl -X POST http://localhost:3000/py/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "pet-1234567890",
    "adopterName": "Alice Johnson",
    "adopterEmail": "alice@example.com"
  }'
```

### 4. Update Pet Status

```bash
# Update pet via TypeScript
curl -X PUT http://localhost:3000/ts/pets/pet-1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "available"
  }'
```

### 5. Test Pet Recommendations

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

### 6. Test Edge Cases

#### Missing Required Fields
```bash
curl -X POST http://localhost:3000/ts/adoptions/apply \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "pet-1234567890"
  }'
# Expected: 400 Bad Request
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
    "petId": "pet-1234567890",
    "adopterName": "Second Adopter",
    "adopterEmail": "second@example.com"
  }'
# Expected: 400 Bad Request (Pet not available)
```

## Background Jobs

### Daily Feeding Reminders
Automated cron jobs run daily to remind staff about pet feeding schedules:

- **TypeScript**: `jobs.feeding.daily.step.ts`
- **JavaScript**: `jobs.feeding.daily.step.js`  
- **Python**: `jobs_feeding_daily.step.py`

## Event Flow

### Adoption Process Events

1. **Application Submitted**
   - `ts.adoption.applied` / `js.adoption.applied` / `py.adoption.applied`

2. **Background Check Completed**
   - `ts.adoption.checked` / `js.adoption.checked` / `py.adoption.checked`

3. **Application Summary Generated**
   - `ts.adoption.summary.generated` / `js.adoption.summary.generated` / `py.adoption.summary.generated`

4. **Decision Made**
   - `ts.adoption.approved` / `js.adoption.approved` / `py.adoption.approved`
   - `ts.adoption.rejected` / `js.adoption.rejected` / `py.adoption.rejected`

5. **Follow-up Sent** (for approved adoptions only)
   - Triggered by approval events

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

The Motia workbench displays three parallel workflow lines:
- **Top line**: TypeScript adoption workflow
- **Middle line**: Python adoption workflow  
- **Bottom line**: JavaScript adoption workflow

Each workflow shows connected steps: Apply → Check → Decision → Followup

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

- **Pet names**: Must be non-empty strings
- **Adopter names**: Must be longer than 2 characters
- **Adopter emails**: Cannot contain "spam"
- **Pet status**: Must be "available" to start adoption process
- **Recommendations**: At least one preference must be provided

## Development

To extend the system:
1. Add new steps with proper `flows: ['pets']` configuration
2. Use language-specific event names to maintain isolation
3. Include comprehensive error handling and logging
4. Update workbench positioning for new steps

## License

This is a demonstration project for Motia workflow capabilities.