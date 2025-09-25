# Pet Store CRUD API with Background Jobs

A multi-language pet management system built with Motia, demonstrating CRUD operations, background job processing, soft delete patterns, and event-driven architecture across TypeScript, JavaScript, and Python implementations.

## Features

- **Multi-language Support**: Complete implementations in TypeScript, JavaScript, and Python
- **Pet Management**: Full CRUD operations for pet records
- **Background Job Processing**: Queue-based and cron-based background jobs
- **Automated Pet Lifecycle**: Orchestrated status transitions from new to available
- **AI Profile Enrichment**: Automatic pet profile generation using OpenAI
- **Agentic Decision Making**: AI agents choose routing decisions with structured rationale
- **Visible Workflow Automation**: Orchestrator triggers specific staff actions for each status change
- **Treatment Scheduling**: Automatic vet appointment and medication scheduling
- **Adoption Management**: Automated adoption posting and interview scheduling
- **Recovery Monitoring**: Treatment progress tracking with follow-up scheduling
- **Soft Delete Pattern**: 30-day retention with automatic cleanup
- **Event-Driven Architecture**: Language-isolated event namespaces with visible connections
- **File-based Storage**: JSON persistence across all implementations
- **Language Parity**: Identical functionality across all three languages
- **RESTful APIs**: Standard HTTP methods for all operations

## Architecture

### Workflow Organization

The system uses a single workflow definition in `motia-workbench.json`:

- `"pets"` - Complete pet management operations for all languages

The workflow includes:
- **CRUD APIs**: Create, Read, Update, Delete operations
- **Background Jobs**: SetNextFeedingReminder queue jobs and Deletion Reaper cron jobs
- **Pet Lifecycle Orchestrator**: Automated status transitions through pet lifecycle stages
- **AI Profile Enrichment**: Automatic pet profile generation using OpenAI
- **Language Isolation**: Each language operates independently with its own event namespace

### Enhanced Pet Data Model

Each pet has the following structure:

```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 24,
  "status": "new",
  "createdAt": 1640995200000,
  "updatedAt": 1640995200000,
  "notes": "Welcome to our pet store! We'll take great care of this pet.",
  "nextFeedingAt": 1641081600000,
  "deletedAt": null,
  "purgeAt": null,
  "profile": {
    "bio": "Buddy is a friendly and energetic golden retriever mix who loves playing fetch and meeting new people. He's great with children and would make an excellent family companion.",
    "breedGuess": "Golden Retriever Mix",
    "temperamentTags": ["friendly", "energetic", "loyal", "playful", "gentle"],
    "adopterHints": "Perfect for active families with children. Needs daily exercise and mental stimulation. Great for first-time dog owners due to his gentle nature."
  }
}
```

**Lifecycle Status Values:**
- `"new"` - Initial status when pet is created
- `"in_quarantine"` - Pet is in quarantine after feeding reminder setup
- `"healthy"` - Pet is healthy and cleared from quarantine
- `"available"` - Pet is ready for adoption
- `"pending"` - Adoption application in progress
- `"adopted"` - Pet has been adopted
- `"ill"` - Pet is identified as ill (random health check)
- `"under_treatment"` - Pet is receiving medical treatment
- `"recovered"` - Pet has recovered from illness (transitions back to healthy)
- `"deleted"` - Pet is soft deleted (scheduled for purging, outside orchestrator)

**Background Job Fields:**
- `notes` - Added by SetNextFeedingReminder background job
- `nextFeedingAt` - Calculated feeding schedule (24 hours from creation)
- `deletedAt` - Timestamp when pet was soft deleted
- `purgeAt` - Timestamp when pet will be permanently removed (deletedAt + 30 days)

**Species Values:** `"dog"`, `"cat"`, `"bird"`, `"other"`

## Background Job System

### Queue-Based Job: SetNextFeedingReminder

**Triggered by**: Creating a pet via any `POST /*/pets` endpoint

**Purpose**: Sets next feeding reminder and adds welcome notes after pet creation without blocking the API response

**Process**:
1. Pet creation API completes immediately with `status: 201`
2. API emits language-specific event (e.g., `js.feeding.reminder.enqueued`)
3. Background job picks up the event and processes asynchronously
4. Job adds welcome notes and calculates next feeding time
5. Job emits completion event with processing metrics

**Console Output**:
```
🐾 Pet created { petId: '1', name: 'Buddy', species: 'dog', status: 'new' }
🔄 Setting next feeding reminder { petId: '1', enqueuedAt: 1640995200000 }
✅ Next feeding reminder set { petId: '1', notes: 'Welcome to our pet store!...', nextFeedingAt: '2022-01-02T00:00:00.000Z' }
```

### Cron-Based Job: Deletion Reaper

**Schedule**: Daily at 2:00 AM (`0 2 * * *`)

**Purpose**: Permanently removes pets that have been soft deleted and are past their purge date

**Process**:
1. Scans for pets with `status="deleted"` and `purgeAt <= now`
2. Permanently removes matching pets from the datastore
3. Emits audit events for each purged pet
4. Reports completion statistics

**Console Output**:
```
🔄 Deletion Reaper started - scanning for pets to purge
💀 Pet permanently purged { petId: '1', name: 'Buddy', deletedAt: '2022-01-01T00:00:00.000Z', purgeAt: '2022-01-31T00:00:00.000Z' }
✅ Deletion Reaper completed { totalScanned: 5, purgedCount: 2, failedCount: 0 }
```

## Section 3 — Pet Lifecycle Orchestrator with Staff Interaction

The Pet Lifecycle Orchestrator manages pet status transitions through a realistic shelter workflow with staff decision points. It's the only component allowed to modify pet status, ensuring consistent state management while requiring human oversight at key stages.

### Core Architecture

**Centralized Control**: Only the orchestrator can modify `pet.status`. All other components emit events.

**Staff-Driven Workflow**: Status changes require staff decisions through the existing PUT API.

**Event-Driven**: Orchestrator subscribes to domain events and validates transition rules.

**Language Isolation**: Each language has its own orchestrator with language-specific event namespaces.

### Hybrid Staff + Automatic Workflow

```
POST /pets → new
↓ (SetNextFeedingReminder completes - automatic)
in_quarantine
↓ (Staff health check via PUT API)
healthy
↓ (AUTOMATIC - orchestrator progression)
available
↓ (Staff adoption process via PUT API)
pending → adopted

Illness Can Happen Anytime:
in_quarantine → ill (Staff finds illness during quarantine)
healthy → ill (Staff assessment during health check)
available → ill (Staff discovers illness before adoption)
↓ (AUTOMATIC - orchestrator starts treatment)
under_treatment
↓ (Staff marks recovered via PUT API)
recovered
↓ (AUTOMATIC - orchestrator clears recovery)
healthy
↓ (AUTOMATIC - orchestrator marks ready)
available
```

### Transition Rules

| Trigger Event | From Status | To Status | Action Type |
|---------------|-------------|-----------|-------------|
| `feeding.reminder.completed` | `new` | `in_quarantine` | **Automatic** |
| `status.update.requested` | `in_quarantine` | `healthy` | **Staff Decision** |
| `status.update.requested` | `healthy` | `available` | **Automatic Progression** |
| `status.update.requested` | `healthy`, `in_quarantine`, `available` | `ill` | **Staff Assessment** |
| `status.update.requested` | `ill` | `under_treatment` | **Automatic Progression** |
| `status.update.requested` | `under_treatment` | `recovered` | **Staff Decision** |
| `status.update.requested` | `recovered` | `healthy` | **Automatic Progression** |
| `status.update.requested` | `available` | `pending` | **Staff Decision** |
| `status.update.requested` | `pending` | `adopted` | **Staff Decision** |
| `status.update.requested` | `pending` | `available` | **Staff Decision** |

### Automatic Progressions

**Healthy → Available**: When a pet becomes healthy, the orchestrator automatically marks them as available for adoption.

**Ill → Under Treatment**: When a pet is marked as ill, the orchestrator automatically starts treatment.

**Recovered → Healthy → Available**: When a pet recovers, the orchestrator automatically clears them to healthy, then immediately to available.

### Staff Decision Points

**Health Assessment**: Staff evaluates pets in quarantine and decides if they're healthy or need medical attention.

**Illness Detection**: Staff identifies when healthy pets become ill.

**Treatment Completion**: Staff determines when treatment is complete and pets have recovered.

**Adoption Process**: Staff manages adoption applications and final adoption completion.

### Console Output Examples

**Normal Workflow with Automatic Progressions**:
```
🐾 Pet created { petId: '1', name: 'Buddy', species: 'dog', status: 'new' }
🔄 Setting next feeding reminder { petId: '1' }
✅ Next feeding reminder set { petId: '1' }
🔄 Lifecycle orchestrator processing { petId: '1', eventType: 'feeding.reminder.completed' }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'new', newStatus: 'in_quarantine', description: 'Pet moved to quarantine after feeding setup' }

👤 Staff requesting status change { petId: '1', currentStatus: 'in_quarantine', requestedStatus: 'healthy' }
🔄 Lifecycle orchestrator processing { petId: '1', eventType: 'status.update.requested', requestedStatus: 'healthy' }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'in_quarantine', newStatus: 'healthy', description: 'Staff health check - pet cleared from quarantine' }

🤖 Orchestrator triggering automatic progression { petId: '1', currentStatus: 'healthy', nextStatus: 'available' }
🤖 Automatic progression { petId: '1', eventType: 'status.update.requested', requestedStatus: 'available', automatic: true }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'healthy', newStatus: 'available', description: 'Automatic progression - pet ready for adoption' }
```

**Invalid Transition Attempt**:
```
👤 Staff requesting status change { petId: '1', currentStatus: 'in_quarantine', requestedStatus: 'available' }
⚠️ Transition rejected { petId: '1', currentStatus: 'in_quarantine', requestedStatus: 'available', reason: 'Invalid transition: cannot change from in_quarantine to available' }
```

**Illness and Treatment Workflow with Automatic Progressions**:
```
👤 Staff requesting status change { petId: '1', currentStatus: 'healthy', requestedStatus: 'ill' }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'healthy', newStatus: 'ill', description: 'Staff assessment - pet identified as ill' }

🤖 Orchestrator triggering automatic progression { petId: '1', currentStatus: 'ill', nextStatus: 'under_treatment' }
🤖 Automatic progression { petId: '1', eventType: 'status.update.requested', requestedStatus: 'under_treatment', automatic: true }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'ill', newStatus: 'under_treatment', description: 'Automatic progression - treatment started' }

👤 Staff requesting status change { petId: '1', currentStatus: 'under_treatment', requestedStatus: 'recovered' }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'under_treatment', newStatus: 'recovered', description: 'Staff assessment - treatment completed' }

🤖 Orchestrator triggering automatic progression { petId: '1', currentStatus: 'recovered', nextStatus: 'healthy' }
🤖 Automatic progression { petId: '1', eventType: 'status.update.requested', requestedStatus: 'healthy', automatic: true }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'recovered', newStatus: 'healthy', description: 'Automatic progression - recovery complete' }

🤖 Orchestrator triggering automatic progression { petId: '1', currentStatus: 'healthy', nextStatus: 'available' }
🤖 Automatic progression { petId: '1', eventType: 'status.update.requested', requestedStatus: 'available', automatic: true }
✅ Lifecycle transition completed { petId: '1', oldStatus: 'healthy', newStatus: 'available', description: 'Automatic progression - pet ready for adoption' }
```

### Integration with Existing System

**CRUD APIs**: The `POST /pets` endpoint creates pets with `status=new` and emits `pet.created` events.

**SetNextFeedingReminder**: After completing, emits `feeding.reminder.completed` to trigger quarantine.

**Background Jobs**: Deletion Reaper remains unchanged and operates outside the lifecycle.

**Soft Delete**: `DELETE /pets/:id` continues to work as before, setting `status=deleted` directly.

### Testing the Staff-Driven Workflow

**Create a Pet and Guide Through Lifecycle**:
```bash
# 1. Create a pet - starts with status=new, automatically moves to in_quarantine
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Buddy", "species": "dog", "ageMonths": 24}'

# 2. Check current status (should be in_quarantine after feeding reminder completes)
curl http://localhost:3000/js/pets/1

# 3. Staff health check - clear from quarantine to healthy
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy"}'

# 4. Staff marks pet ready for adoption
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "available"}'

# 5. Adoption application received
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# 6. Adoption completed
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'
```

**Test Invalid Transitions**:
```bash
# Try to skip quarantine (should be rejected)
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "available"}'
# Returns 202 with rejection message
```

**Illness and Treatment Workflow**:
```bash
# Mark healthy pet as ill
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "ill"}'

# Start treatment
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "under_treatment"}'

# Mark as recovered
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "recovered"}'

# Clear back to healthy
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy"}'
```

### Orchestrator Behavior

**Validation**: Only valid transitions are allowed based on current status and transition rules.

**Staff Control**: All status changes (except initial quarantine) require explicit staff decisions.

**Idempotency**: Attempting to set the same status twice has no effect.

**Error Handling**: Invalid transitions return 202 with clear rejection reasons.

## API Endpoints

All three languages provide identical CRUD functionality with background job integration:

### JavaScript Endpoints (`/js/pets`)

| Method | Endpoint | Description | Background Jobs |
|--------|----------|-------------|-----------------|
| POST | `/js/pets` | Create a new pet | Triggers PostCreateLite |
| GET | `/js/pets` | List all pets | None |
| GET | `/js/pets/:id` | Get pet by ID | None |
| PUT | `/js/pets/:id` | Update pet | None |
| DELETE | `/js/pets/:id` | Soft delete pet | Schedules for purging |

### TypeScript Endpoints (`/ts/pets`)

| Method | Endpoint | Description | Background Jobs |
|--------|----------|-------------|-----------------|
| POST | `/ts/pets` | Create a new pet | Triggers PostCreateLite |
| GET | `/ts/pets` | List all pets | None |
| GET | `/ts/pets/:id` | Get pet by ID | None |
| PUT | `/ts/pets/:id` | Update pet | None |
| DELETE | `/ts/pets/:id` | Soft delete pet | Schedules for purging |

### Python Endpoints (`/py/pets`)

| Method | Endpoint | Description | Background Jobs |
|--------|----------|-------------|-----------------|
| POST | `/py/pets` | Create a new pet | Triggers PostCreateLite |
| GET | `/py/pets` | List all pets | None |
| GET | `/py/pets/:id` | Get pet by ID | None |
| PUT | `/py/pets/:id` | Update pet | None |
| DELETE | `/py/pets/:id` | Soft delete pet | Schedules for purging |

## Enhanced API Behavior

### Create Pet (with Background Processing)

**Request:**
```bash
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "ageMonths": 24
  }'
```

**Immediate Response:**
```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 24,
  "status": "new",
  "createdAt": 1640995200000,
  "updatedAt": 1640995200000
}
```

**After Background Job Completion:**
```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 24,
  "status": "new",
  "createdAt": 1640995200000,
  "updatedAt": 1640995250000,
  "notes": "Welcome to our pet store! We'll take great care of this pet.",
  "nextFeedingAt": 1641081600000
}
```

**Events Emitted:**
- `js.pet.created` - Immediate creation event
- `js.job.postcreate.enqueued` - Background job queued
- `js.job.postcreate.completed` - Background job finished

### Soft Delete Pet

**Request:**
```bash
curl -X DELETE http://localhost:3000/js/pets/1
```

**Response (202 Accepted):**
```json
{
  "message": "Pet scheduled for deletion",
  "petId": "1",
  "purgeAt": 1643587200000
}
```

**Pet Status After Soft Delete:**
```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 24,
  "status": "deleted",
  "deletedAt": 1640995200000,
  "purgeAt": 1643587200000,
  "updatedAt": 1640995200000
}
```

**Events Emitted:**
- `js.pet.soft.deleted` - Soft deletion event

## Event System with Language Isolation

The system uses language-specific event namespaces to prevent cross-language triggering:

### JavaScript Events
- `js.pet.created` - Pet created via JavaScript API
- `js.job.postcreate.enqueued` - Triggers JavaScript PostCreateLite job only
- `js.job.postcreate.completed` - JavaScript job completion
- `js.pet.soft.deleted` - Pet soft deleted via JavaScript API
- `js.pet.purged` - Pet permanently removed by JavaScript reaper
- `js.reaper.completed` - JavaScript reaper completion

### TypeScript Events
- `ts.pet.created` - Pet created via TypeScript API
- `ts.job.postcreate.enqueued` - Triggers TypeScript PostCreateLite job only
- `ts.job.postcreate.completed` - TypeScript job completion
- `ts.pet.soft.deleted` - Pet soft deleted via TypeScript API
- `ts.pet.purged` - Pet permanently removed by TypeScript reaper
- `ts.reaper.completed` - TypeScript reaper completion

### Python Events
- `py.pet.created` - Pet created via Python API
- `py.job.postcreate.enqueued` - Triggers Python PostCreateLite job only
- `py.job.postcreate.completed` - Python job completion
- `py.pet.soft.deleted` - Pet soft deleted via Python API
- `py.pet.purged` - Pet permanently removed by Python reaper
- `py.reaper.completed` - Python reaper completion

## File Structure

```
steps/
├── javascript/
│   ├── create-pet.step.js           # POST /js/pets (triggers PostCreateLite)
│   ├── get-pets.step.js             # GET /js/pets
│   ├── get-pet.step.js              # GET /js/pets/:id
│   ├── update-pet.step.js           # PUT /js/pets/:id
│   ├── delete-pet.step.js           # DELETE /js/pets/:id (soft delete)
│   ├── postcreate-lite.job.step.js  # Background job (queue-based)
│   ├── deletion-reaper.cron.step.js # Background job (cron-based)
│   └── js-store.js                  # Data persistence layer
├── typescript/
│   ├── create-pet.step.ts           # POST /ts/pets (triggers PostCreateLite)
│   ├── get-pets.step.ts             # GET /ts/pets
│   ├── get-pet.step.ts              # GET /ts/pets/:id
│   ├── update-pet.step.ts           # PUT /ts/pets/:id
│   ├── delete-pet.step.ts           # DELETE /ts/pets/:id (soft delete)
│   ├── postcreate-lite.job.step.ts  # Background job (queue-based)
│   ├── deletion-reaper.cron.step.ts # Background job (cron-based)
│   └── ts-store.ts                  # Data persistence layer
├── python/
│   ├── create_pet.step.py           # POST /py/pets (triggers PostCreateLite)
│   ├── get_pets.step.py             # GET /py/pets
│   ├── get_pet.step.py              # GET /py/pets/:id
│   ├── update_pet.step.py           # PUT /py/pets/:id
│   ├── delete_pet.step.py           # DELETE /py/pets/:id (soft delete)
│   ├── postcreate_lite_job.step.py  # Background job (queue-based)
│   ├── deletion_reaper.cron.step.py # Background job (cron-based)
│   └── services/
│       ├── pet_store.py             # Data persistence layer
│       └── types.py                 # Type definitions
└── motia-workbench.json             # Workflow configuration
```

## Data Storage

All implementations use a shared JSON file for data persistence:

**Location:** `.data/pets.json`

**Structure:**
```json
{
  "seq": 2,
  "pets": {
    "1": {
      "id": "1",
      "name": "Buddy",
      "species": "dog",
      "ageMonths": 24,
      "status": "new",
      "createdAt": 1640995200000,
      "updatedAt": 1640995250000,
      "notes": "Welcome to our pet store! We'll take great care of this pet.",
      "nextFeedingAt": 1641081600000
    }
  }
}
```

## Testing Examples

### Background Job Testing

**Test PostCreateLite Job:**
```bash
# Create a pet and watch console for background job processing
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Whiskers", "species": "cat", "ageMonths": 12}'

# Check pet record after job completion
curl http://localhost:3000/js/pets/1
```

**Expected Console Output:**
```
🐾 Pet created { petId: '1', name: 'Whiskers', species: 'cat', status: 'new' }
🔄 PostCreateLite job started { petId: '1', enqueuedAt: 1640995200000 }
✅ PostCreateLite job completed { petId: '1', processingTimeMs: 50 }
```

**Test Soft Delete:**
```bash
# Soft delete a pet
curl -X DELETE http://localhost:3000/js/pets/1

# Verify pet is marked as deleted but still exists
curl http://localhost:3000/js/pets/1
```

**Test Language Isolation:**
```bash
# Create pets in different languages
curl -X POST http://localhost:3000/js/pets -H "Content-Type: application/json" -d '{"name": "JSPet", "species": "dog", "ageMonths": 12}'
curl -X POST http://localhost:3000/ts/pets -H "Content-Type: application/json" -d '{"name": "TSPet", "species": "cat", "ageMonths": 18}'
curl -X POST http://localhost:3000/py/pets -H "Content-Type: application/json" -d '{"name": "PyPet", "species": "bird", "ageMonths": 6}'

# Each should only trigger its own language's background job
```

### Cron Job Testing

To test the Deletion Reaper cron job, you can temporarily change the cron schedule:

1. **Edit cron schedule** in `deletion-reaper.cron.step.*` files:
   ```javascript
   cron: '* * * * *', // Run every minute for testing
   ```

2. **Create and soft delete a pet:**
   ```bash
   curl -X POST http://localhost:3000/js/pets -H "Content-Type: application/json" -d '{"name": "TestPet", "species": "dog", "ageMonths": 12}'
   curl -X DELETE http://localhost:3000/js/pets/1
   ```

3. **Manually set purgeAt to past date** in `.data/pets.json`

4. **Watch console for reaper execution** (runs every minute)

## Validation

All create and update operations include validation:

### Create Pet Validation
- `name`: Required string, non-empty after trim
- `species`: Must be one of: `"dog"`, `"cat"`, `"bird"`, `"other"`
- `ageMonths`: Required finite number

### Update Pet Validation
- `name`: Optional string
- `species`: Optional, must be valid species
- `ageMonths`: Optional finite number
- `status`: Optional, must be one of: `"new"`, `"available"`, `"pending"`, `"adopted"`, `"deleted"`

### Error Responses

**400 Bad Request** - Invalid input data
```json
{
  "message": "Invalid payload: {name, species, ageMonths}"
}
```

**404 Not Found** - Pet doesn't exist
```json
{
  "message": "Not found"
}
```

**202 Accepted** - Soft delete scheduled
```json
{
  "message": "Pet scheduled for deletion",
  "petId": "1",
  "purgeAt": 1643587200000
}
```

## Section 4 — Agentic Workflow (AI inside the flow)

The system includes both **AI Profile Enrichment** (non-routing) and **True Agentic Decision Making** where LLM agents choose which emits to fire based on pet context. This demonstrates how AI agents can make routing decisions within event-driven workflows.

### AI Profile Enrichment (Non-Routing)

The original enrichment feature automatically generates detailed pet profiles:

1. **Trigger**: When a pet is created, the `pet.created` event is emitted
2. **AI Agent Activation**: The AI Profile Enrichment step listens to `pet.created` events
3. **OpenAI API Call**: The agent calls OpenAI with pet details (name, species)
4. **Profile Generation**: AI generates bio, breed guess, temperament tags, and adopter hints
5. **Data Storage**: The generated profile is stored in the pet record under the `profile` field
6. **Event Emission**: Events are emitted for `profile_enrichment_started` and `profile_enrichment_completed`

### True Agentic Decision Making (Routing)

The system now includes **Agent Decision Steps** where LLM agents choose from a registry of allowed emits based on pet context. The orchestrator remains the only component that can mutate pet status.

#### How Agent Decision Making Works

1. **RESTful Trigger**: Staff calls `POST /pets/{id}/health-review` or `POST /pets/{id}/adoption-review`
2. **Context Building**: System builds agent context with pet data (species, age, symptoms, flags, profile)
3. **Emit Registry**: Agent is shown available emits (tools) with descriptions and orchestrator effects
4. **LLM Decision**: OpenAI chooses exactly one emit and provides structured rationale
5. **Emit Firing**: System fires the chosen emit; orchestrator consumes it and applies transitions
6. **Artifact Storage**: Complete decision artifact stored (inputs, available emits, model output, chosen emit, rationale)

### RESTful Agent Endpoints

#### Health Review Agent
**Endpoint**: `POST /ts/pets/{id}/health-review` (TypeScript), `POST /js/pets/{id}/health-review` (JavaScript), `POST /py/pets/{id}/health-review` (Python)

**Purpose**: AI agent evaluates pet health and chooses appropriate health action

**Available Emits**:
| Emit ID | Orchestrator Effect | Description |
|---------|-------------------|-------------|
| `emit.health.treatment_required` | `healthy → ill → under_treatment` | Pet requires medical treatment due to health concerns |
| `emit.health.no_treatment_needed` | `stay healthy` | Pet is healthy and requires no medical intervention |

#### Adoption Review Agent
**Endpoint**: `POST /ts/pets/{id}/adoption-review` (TypeScript), `POST /js/pets/{id}/adoption-review` (JavaScript), `POST /py/pets/{id}/adoption-review` (Python)

**Purpose**: AI agent evaluates adoption readiness and chooses appropriate adoption action

**Available Emits**:
| Emit ID | Orchestrator Effect | Description |
|---------|-------------------|-------------|
| `emit.adoption.needs_data` | `add needs_data flag (blocks available)` | Pet needs additional data before being available for adoption |
| `emit.adoption.ready` | `healthy → available (respect guards)` | Pet is ready for adoption and can be made available |

### Guards & Orchestrator Rules

The orchestrator enforces guards and only allows valid transitions:

- **`must_be_healthy`**: Pet must be in healthy status
- **`no_needs_data_flag`**: Pet cannot have the `needs_data` flag (blocks adoption)

If a chosen emit violates guards, the orchestrator logs rejection and does not mutate status.

### Agent Decision Artifacts

Each agent decision creates a stored artifact:

```json
{
  "petId": "pet-123",
  "agentType": "health-review",
  "timestamp": 1640995200000,
  "inputs": {
    "petId": "pet-123",
    "species": "dog",
    "ageMonths": 24,
    "currentStatus": "healthy",
    "symptoms": ["coughing", "lethargy"],
    "flags": [],
    "profile": { "bio": "...", "breedGuess": "Golden Retriever" }
  },
  "availableEmits": [
    {
      "id": "emit.health.treatment_required",
      "description": "Pet requires medical treatment due to health concerns",
      "orchestratorEffect": "healthy → ill → under_treatment"
    },
    {
      "id": "emit.health.no_treatment_needed", 
      "description": "Pet is healthy and requires no medical intervention",
      "orchestratorEffect": "stay healthy"
    }
  ],
  "modelOutput": "{\"chosenEmit\": \"emit.health.treatment_required\", \"rationale\": \"Pet shows concerning symptoms of coughing and lethargy that require veterinary evaluation and treatment.\"}",
  "parsedDecision": {
    "chosenEmit": "emit.health.treatment_required",
    "rationale": "Pet shows concerning symptoms of coughing and lethargy that require veterinary evaluation and treatment."
  },
  "success": true
}
```

### AI Profile Enrichment Fields

The AI profile enrichment agent enriches each pet with:

- **`bio`**: A warm, engaging 2-3 sentence description appealing to potential adopters
- **`breedGuess`**: AI's best guess at the breed or breed mix
- **`temperamentTags`**: Array of 3-5 personality traits (e.g., "friendly", "energetic", "calm")
- **`adopterHints`**: Practical advice for potential adopters (family type, living situation, care needs)

### Sample AI-Enriched Pet Record

```json
{
  "id": "pet-123",
  "name": "Luna",
  "species": "cat",
  "ageMonths": 18,
  "status": "new",
  "createdAt": 1640995200000,
  "updatedAt": 1640995201500,
  "profile": {
    "bio": "Luna is a graceful and independent cat with striking green eyes who enjoys sunny windowsills and gentle head scratches. She's perfectly content being the only pet and would thrive in a quiet, loving home.",
    "breedGuess": "Domestic Shorthair",
    "temperamentTags": ["independent", "calm", "affectionate", "observant", "gentle"],
    "adopterHints": "Ideal for singles or couples seeking a low-maintenance companion. Prefers quiet environments and would do best as an only pet. Perfect for apartment living."
  }
}
```

### Environment Setup

To enable AI profile enrichment, you need an OpenAI API key:

1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Set Environment Variable**:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```
3. **Or create `.env` file**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### AI Agent Behavior

- **Automatic**: Triggers on every pet creation
- **Idempotent**: Re-enriching overwrites existing profile (no duplicates)
- **Resilient**: Falls back to default profile if AI call fails
- **Non-blocking**: Runs asynchronously, doesn't slow down pet creation
- **Status-safe**: Never modifies pet status, only enriches metadata
- **Language-isolated**: Each language has its own AI agent step

### Console Output Examples

**AI Enrichment Started:**
```
🤖 AI Profile Enrichment started { petId: 'pet-123', name: 'Luna', species: 'cat' }
```

**AI Enrichment Completed:**
```
✅ AI Profile Enrichment completed {
  petId: 'pet-123',
  profile: {
    bio: 'Luna is a graceful and independent cat with...',
    breedGuess: 'Domestic Shorthair',
    temperamentTags: ['independent', 'calm', 'affectionate', 'observant', 'gentle'],
    adopterHints: 'Ideal for singles or couples seeking a low-main...'
  }
}
```

**Error Handling:**
```
❌ AI Profile Enrichment failed { petId: 'pet-123', error: 'OpenAI API rate limit exceeded' }
```

### Testing Agentic Decision Making

#### Health Review Agent Testing

```bash
# 1. Create a pet and wait for it to become healthy
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Max", "species": "dog", "ageMonths": 36}'

# 2. Add symptoms to the pet (via update)
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["coughing", "lethargy"]}'

# 3. Trigger health review - agent will choose treatment_required
curl -X POST http://localhost:3000/ts/pets/1/health-review \
  -H "Content-Type: application/json"

# Expected response:
{
  "message": "Health review completed",
  "petId": "1",
  "agentDecision": {
    "chosenEmit": "emit.health.treatment_required",
    "rationale": "Pet shows concerning symptoms that require veterinary evaluation"
  },
  "emitFired": "ts.health.treatment_required"
}

# 4. Check pet status - should be "under_treatment"
curl http://localhost:3000/ts/pets/1
```

#### Adoption Review Agent Testing

```bash
# 1. Create a healthy pet with complete profile
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Luna", "species": "cat", "ageMonths": 18}'

# 2. Wait for AI enrichment to complete, then trigger adoption review
curl -X POST http://localhost:3000/ts/pets/1/adoption-review \
  -H "Content-Type: application/json"

# Expected response:
{
  "message": "Adoption review completed", 
  "petId": "1",
  "agentDecision": {
    "chosenEmit": "emit.adoption.ready",
    "rationale": "Pet has complete profile and is ready for adoption"
  },
  "emitFired": "ts.adoption.ready"
}

# 3. Check pet status - should be "available"
curl http://localhost:3000/ts/pets/1
```

#### Guard Testing

```bash
# Test guard blocking - add needs_data flag then try adoption
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"flags": ["needs_data"]}'

curl -X POST http://localhost:3000/ts/pets/1/adoption-review

# Agent may choose adoption.ready, but orchestrator will block due to needs_data flag
```

### Testing AI Profile Enrichment

Create a pet and watch the AI enrichment happen automatically:

```bash
# Create a pet - AI enrichment will trigger automatically
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "dog",
    "ageMonths": 36
  }'

# Check the pet record after a few seconds to see the AI-generated profile
curl http://localhost:3000/ts/pets/[pet-id]
```

The pet record will include the AI-generated `profile` field with personalized bio, breed guess, temperament tags, and adopter hints.

### Key Differences: Enrichment vs Agentic Routing

| Aspect | AI Profile Enrichment | Agentic Decision Making |
|--------|----------------------|------------------------|
| **Purpose** | Generate pet profile data | Choose workflow routing decisions |
| **Trigger** | Automatic on `pet.created` | Manual via RESTful endpoints |
| **Decision Type** | Data generation (non-routing) | Emit selection (routing) |
| **LLM Role** | Content creator | Decision maker |
| **Orchestrator** | Not involved in routing | Consumes chosen emits and applies transitions |
| **Idempotency** | Overwrites existing profiles | Cached decisions within time window |
| **Artifacts** | Profile data stored on pet | Decision artifacts stored separately |
| **Guards** | None | Enforced by orchestrator |
| **Status Changes** | None | Potential status transitions via orchestrator |

**Enrichment** creates content; **Agentic Routing** makes decisions that drive workflow state changes.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the project root:
   ```bash
   # .env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Sample `.env.example` file:**
   ```bash
   # Environment Variables for Pet Management System
   
   # OpenAI API Configuration
   # Required for AI Profile Enrichment feature
   # Get your API key from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database Configuration (if needed)
   # DATABASE_URL=your_database_url_here
   
   # Other API Keys (add as needed)
   # SOME_OTHER_API_KEY=your_other_api_key_here
   ```
   
   Or set the environment variable directly:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Get your OpenAI API key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key
   - Copy the key and add it to your environment

3. **Start Motia Server**
   ```bash
   motia dev
   ```

4. **Open Workbench**
   - Navigate to Motia Workbench
   - Select the `pets` workflow
   - View all CRUD operations and background jobs for all three languages

5. **Test APIs and Background Jobs**
   - Use the provided curl examples
   - Monitor console output for background job processing and AI enrichment
   - Check `.data/pets.json` for data persistence and AI-generated profiles
   - **Note**: AI profile enrichment requires a valid `OPENAI_API_KEY`. Without it, pets will receive fallback profiles.

## Key Learning Points

This example demonstrates:

1. **Multi-language Implementation**: Same functionality in TypeScript, JavaScript, and Python
2. **RESTful API Design**: Standard HTTP methods and response codes
3. **Background Job Patterns**: Both queue-based (event-triggered) and cron-based (scheduled) jobs
4. **AI Integration**: Seamless AI agents within event-driven workflows
5. **Soft Delete Pattern**: Graceful deletion with recovery window and automatic cleanup
6. **Event-Driven Architecture**: Language-isolated event namespaces prevent cross-triggering
7. **Non-Blocking Processing**: Background jobs and AI enrichment don't slow down API responses
8. **Data Validation**: Input validation and error handling
9. **File-based Persistence**: Simple JSON storage across languages
10. **Workflow Visualization**: Using Motia Workbench for system understanding
11. **Audit Logging**: Comprehensive event emission for system monitoring
12. **AI Resilience**: Graceful fallbacks when AI services are unavailable

## Section 5 — Visible Workflow Extensions (Staff Action Automation)

The system now includes **Visible Workflow Extensions** that transform the orchestrator from a "black hole" into a **visible workflow controller** that guides staff through each step. Instead of silently updating status, the orchestrator now emits events that trigger specific staff actions.

### The Problem: Hidden Workflow

**Before**: When pet status changed, the orchestrator would silently update the status internally, leaving staff unaware of what actions needed to be taken next.

```
Pet Status Change → Orchestrator → [Silent Status Update] → END
```

### The Solution: Visible Workflow

**After**: The orchestrator now emits specific events that trigger visible staff actions, making the workflow transparent and actionable.

```
Pet Status Change → Orchestrator → Next Action Event → Staff Task
     ↓                    ↓              ↓              ↓
  healthy → ill    →  Status Update  →  Treatment   →  Schedule Vet
  ill → under_treatment → Status Update → Treatment → Medication
  healthy → available → Status Update → Adoption → Post Listing
  under_treatment → recovered → Status Update → Recovery → Follow-up
```

### New Workflow Steps

#### 1. Treatment Scheduler
**Purpose**: Automatically schedules veterinary treatment and medication when pets need medical care

**Trigger**: `treatment.required` event from orchestrator
**Actions**:
- Determines treatment urgency based on symptoms
- Schedules vet appointments (2 hours for urgent, 24 hours for normal)
- Assigns required staff (veterinarian, nurse)
- Prescribes appropriate medication
- Generates medication instructions

**Example Output**:
```json
{
  "petId": "1",
  "treatmentSchedule": {
    "scheduledAt": 1640995200000,
    "urgency": "normal",
    "treatmentType": "Pain Management",
    "requiredStaff": ["veterinarian"],
    "medication": ["Pain Relief (Ibuprofen)"]
  },
  "nextSteps": [
    "Notify veterinary staff",
    "Prepare treatment room", 
    "Update pet medication schedule"
  ]
}
```

#### 2. Adoption Posting
**Purpose**: Creates adoption listings and schedules interviews when pets are ready for adoption

**Trigger**: `adoption.ready` event from orchestrator
**Actions**:
- Creates adoption posting with pet details
- Calculates adoption fees based on age and breed
- Generates adoption requirements
- Schedules initial screening interviews
- Prepares adoption paperwork

**Example Output**:
```json
{
  "petId": "1",
  "adoptionPosting": {
    "title": "Buddy - Golden Retriever Available for Adoption",
    "adoptionFee": 200,
    "requirements": [
      "Must be 21 years or older",
      "Valid photo ID required",
      "Reference from current veterinarian"
    ]
  },
  "nextSteps": [
    "Share on social media",
    "Update shelter website",
    "Notify adoption coordinators"
  ]
}
```

#### 3. Recovery Monitor
**Purpose**: Tracks treatment progress and schedules follow-up health checks

**Trigger**: `treatment.started` or `treatment.completed` events from orchestrator
**Actions**:
- Creates recovery plans with milestones
- Schedules monitoring checkpoints
- Tracks recovery indicators
- Schedules follow-up appointments
- Prepares discharge paperwork

**Example Output**:
```json
{
  "petId": "1",
  "recoveryPlan": {
    "expectedRecoveryTime": "1-2 weeks",
    "milestones": [
      {"day": 1, "milestone": "Initial treatment response"},
      {"day": 7, "milestone": "Primary healing indicators"}
    ],
    "monitoringSchedule": [
      {"time": "every 2 hours", "check": "vital signs", "priority": "high"}
    ]
  }
}
```

### Workflow Event Flow

The orchestrator now explicitly emits these events in its configuration:

```javascript
// All orchestrators now include these emits
emits: [
  'lifecycle.transition.completed',
  'lifecycle.transition.rejected',
  'treatment.required',        // → Treatment Scheduler
  'adoption.ready',           // → Adoption Posting  
  'treatment.completed',      // → Recovery Monitor
  'health.restored'          // → Health Check Scheduler
]
```

### Visual Workflow in Motia Workbench

The Motia Workbench now shows clear connections:

```
[Agent Steps] → [Orchestrator] → [Staff Action Steps]
     ↓              ↓                    ↓
Health Review → Status Update → Treatment Scheduler
Adoption Review → Status Update → Adoption Posting
Manual Update → Status Update → Recovery Monitor
```

### Comprehensive Testing Guide

This guide will walk you through the complete pet management workflow, demonstrating how AI agents, orchestrators, and staff automation work together.

#### Prerequisites
```bash
# 1. Start the Motia server
npm start

# 2. Verify server is running (should see "Server running on port 3000")
# 3. Keep the server logs open to observe the workflow in action
```

#### Test 1: Basic Pet Creation & Lifecycle
**Purpose**: Understand the automatic pet lifecycle progression

```bash
# Step 1: Create a healthy pet
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Luna", "species": "cat", "ageMonths": 12}'

# Expected Response: {"id":"X","name":"Luna","species":"cat","ageMonths":12,"status":"new",...}
# Note the pet ID for subsequent commands

# Step 2: Check pet status after creation
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status should be "in_quarantine" (automatic progression from "new")
# Observe in logs: Feeding reminder setup → AI profile enrichment started → Status: new → in_quarantine

# Step 3: Wait for AI enrichment to complete (check logs)
# Expected: AI profile enrichment completed with bio, breed guess, temperament tags
```

#### Test 2: AI Health Review - No Treatment Needed
**Purpose**: Test AI agent decision making for healthy pets

```bash
# Step 1: Trigger health review on quarantined pet
curl -X POST http://localhost:3000/ts/pets/X/health-review

# Expected Response: 
# {
#   "message": "Health review completed",
#   "agentDecision": {
#     "chosenEmit": "emit.health.no_treatment_needed",
#     "rationale": "Pet is healthy with no symptoms..."
#   },
#   "emitFired": "ts.health.no_treatment_needed"
# }

# Step 2: Check pet status after health review
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status should be "available" (in_quarantine → healthy → available)
# Observe in logs: 
# - Health review agent triggered
# - OpenAI API called and decision made
# - Orchestrator: Status updated in_quarantine → healthy
# - Automatic progression: healthy → available
```

#### Test 3: AI Health Review - Treatment Required
**Purpose**: Test AI agent decision making for sick pets

```bash
# Step 1: Create a pet with symptoms
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max", 
    "species": "dog", 
    "ageMonths": 18,
    "symptoms": ["coughing", "lethargy", "fever"],
    "weightKg": 15.5
  }'

# Expected: Symptoms and weight are now stored in the pet record

# Step 2: Manually set pet to healthy status (simulate initial assessment)
curl -X PUT http://localhost:3000/ts/pets/Y \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy"}'

# Step 3: Trigger health review on symptomatic pet
curl -X POST http://localhost:3000/ts/pets/Y/health-review

# Expected Response:
# {
#   "message": "Health review completed",
#   "agentDecision": {
#     "chosenEmit": "emit.health.treatment_required",
#     "rationale": "Pet showing concerning symptoms: coughing, lethargy, fever..."
#   },
#   "emitFired": "ts.health.treatment_required"
# }

# Step 4: Check pet status progression
curl -X GET http://localhost:3000/ts/pets/Y

# Expected: Status should be "available" (healthy → ill → under_treatment → recovered → available)
# Observe in logs:
# - AI agent correctly identified symptoms
# - Orchestrator: Status updated healthy → ill
# - Orchestrator: Emitted ts.treatment.required
# - Treatment Scheduler: Treatment scheduled (if step exists)
# - Automatic progression through treatment stages
```

#### Test 4: AI Adoption Review
**Purpose**: Test AI agent decision making for adoption readiness

```bash
# Step 1: Trigger adoption review on available pet
curl -X POST http://localhost:3000/ts/pets/X/adoption-review

# Expected Response:
# {
#   "message": "Adoption review completed",
#   "agentDecision": {
#     "chosenEmit": "emit.adoption.ready",
#     "rationale": "Pet has complete profile and is ready for adoption..."
#   },
#   "emitFired": "ts.adoption.ready"
# }

# Step 2: Check pet status
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status remains "available" (already available)
# Observe in logs:
# - Adoption review agent triggered
# - AI analyzed complete profile (bio, breed, temperament)
# - Orchestrator: Emitted ts.adoption.ready
# - Adoption Posting: Adoption listing created (if step exists)
```

#### Test 5: Manual Status Transitions
**Purpose**: Test orchestrator guard enforcement and manual workflow control

```bash
# Step 1: Try invalid transition (should be rejected)
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Expected Response: 
# {"message": "Status change request submitted", "currentStatus": "available", "requestedStatus": "adopted"}
# Check logs: "Transition rejected: Invalid transition from available to adopted"

# Step 2: Valid transition - mark as pending adoption
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# Expected: Status should change to "pending"
# Observe in logs: Orchestrator processed valid transition

# Step 3: Complete adoption
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Expected: Status should change to "adopted"
```

#### Test 6: Treatment Recovery Flow
**Purpose**: Test the complete treatment and recovery workflow

```bash
# Step 1: Create a pet and manually set to under_treatment
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Bella", "species": "dog", "ageMonths": 36}'

# Step 2: Set to under_treatment status
curl -X PUT http://localhost:3000/ts/pets/Z \
  -H "Content-Type: application/json" \
  -d '{"status": "under_treatment"}'

# Step 3: Mark treatment as completed
curl -X PUT http://localhost:3000/ts/pets/Z \
  -H "Content-Type: application/json" \
  -d '{"status": "recovered"}'

# Expected: Status progression: under_treatment → recovered → healthy → available
# Observe in logs:
# - Orchestrator: Status updated under_treatment → recovered
# - Orchestrator: Emitted ts.treatment.completed
# - Recovery Monitor: Recovery plan created (if step exists)
# - Automatic progression: recovered → healthy → available
```

#### Test 7: Error Handling & Edge Cases
**Purpose**: Test system resilience and guard enforcement

```bash
# Step 1: Try health review on adopted pet (should be rejected)
curl -X POST http://localhost:3000/ts/pets/X/health-review

# Expected: Error message about invalid status

# Step 2: Try adoption review on ill pet (should be rejected)
curl -X POST http://localhost:3000/ts/pets/Y/adoption-review

# Expected: Error message about invalid status

# Step 3: Try to get non-existent pet
curl -X GET http://localhost:3000/ts/pets/999

# Expected: 404 error
```

#### Test 8: Multi-Language Consistency
**Purpose**: Verify identical behavior across TypeScript, JavaScript, and Python

```bash
# Test JavaScript implementation
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "JS_Pet", "species": "cat", "ageMonths": 6}'

curl -X POST http://localhost:3000/js/pets/JS_PET_ID/health-review

# Test Python implementation  
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Py_Pet", "species": "dog", "ageMonths": 12}'

curl -X POST http://localhost:3000/py/pets/PY_PET_ID/health-review

# Expected: Identical behavior and responses across all languages
```

#### Test 9: Workflow Visualization
**Purpose**: Observe the complete workflow in Motia Workbench

1. **Open Motia Workbench** in your browser
2. **Navigate to the Pet Management workflow**
3. **Observe visual connections**:
   - Agent steps connected to orchestrator
   - Orchestrator connected to staff action steps
   - Event flow arrows showing data movement
4. **Trigger events** and watch real-time updates
5. **Check step logs** to see detailed execution traces

#### Expected Workflow Behavior Summary

| Test Scenario | AI Decision | Orchestrator Action | Staff Action Triggered |
|---------------|-------------|-------------------|----------------------|
| Healthy Pet Review | No Treatment Needed | Status: healthy → available | Adoption Posting |
| Sick Pet Review | Treatment Required | Status: healthy → ill → under_treatment | Treatment Scheduler |
| Adoption Review | Ready for Adoption | Status: available (unchanged) | Adoption Posting |
| Treatment Completion | Manual Update | Status: under_treatment → recovered | Recovery Monitor |
| Invalid Transition | N/A | Transition Rejected | No Action |

#### Key Observations

1. **🤖 AI Intelligence**: Agents make contextual decisions based on pet data
2. **🔄 Orchestrator Control**: Central authority manages all status transitions
3. **📋 Staff Automation**: Each status change triggers specific staff tasks
4. **🛡️ Guard Enforcement**: Invalid transitions are properly rejected
5. **⚡ Automatic Progression**: Pets move through lifecycle stages automatically
6. **📊 Complete Audit**: Every decision and action is logged and traceable
7. **🌐 Language Parity**: Identical behavior across TypeScript, JavaScript, and Python

This comprehensive testing demonstrates how the pet management system transforms from a simple CRUD API into an intelligent workflow automation platform that guides staff through every step of pet care.

### Benefits of Visible Workflow

1. **🚀 Transparency**: Staff can see exactly what actions are triggered by status changes
2. **📋 Actionable**: Each status change results in specific staff tasks
3. **🔄 Traceable**: Complete audit trail of decisions and actions
4. **⚡ Efficient**: Automatic scheduling and task assignment
5. **🎯 Guided**: Clear next steps for staff at each stage
6. **📊 Monitorable**: Visible workflow progress in Motia Workbench

This transforms the pet management system from a simple status tracker into a **comprehensive workflow automation platform** that guides staff through every step of pet care.

---

This is a demonstration project for Motia workflow capabilities, showcasing modern backend patterns including CRUD operations, background job processing, event-driven architecture, and visible workflow automation.