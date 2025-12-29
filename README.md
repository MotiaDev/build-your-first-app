# Pet Store CRUD API with Background Jobs

A multi-language pet management system built with Motia, demonstrating CRUD operations, background job processing, soft delete patterns, and event-driven architecture across TypeScript, JavaScript, and Python implementations.

## Features

- **Multi-language Support**: Complete implementations in TypeScript, JavaScript, and Python
- **Pet Management**: Full CRUD operations for pet records
- **Background Job Processing**: Queue-based and cron-based background jobs
- **Automated Pet Lifecycle**: Orchestrated status transitions from new to available
- **Soft Delete Pattern**: 30-day retention with automatic cleanup
- **Event-Driven Architecture**: Language-isolated event namespaces
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
  "purgeAt": null
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
src/
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
│   └── deletion_reaper.cron.step.py # Background job (cron-based)
└── services/
    ├── pet_store.py                 # Data persistence layer
    └── types.py                     # Type definitions
motia-workbench.json             # Workflow configuration
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

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Motia Server**
   ```bash
   npm run dev
   ```

3. **Open Workbench**
   - Navigate to Motia Workbench
   - Select the `pets` workflow
   - View all CRUD operations and background jobs for all three languages

4. **Test APIs and Background Jobs**
   - Use the provided curl examples
   - Monitor console output for background job processing
   - Check `.data/pets.json` for data persistence and background job effects

## Key Learning Points

This example demonstrates:

1. **Multi-language Implementation**: Same functionality in TypeScript, JavaScript, and Python
2. **RESTful API Design**: Standard HTTP methods and response codes
3. **Background Job Patterns**: Both queue-based (event-triggered) and cron-based (scheduled) jobs
4. **Soft Delete Pattern**: Graceful deletion with recovery window and automatic cleanup
5. **Event-Driven Architecture**: Language-isolated event namespaces prevent cross-triggering
6. **Non-Blocking Processing**: Background jobs don't slow down API responses
7. **Data Validation**: Input validation and error handling
8. **File-based Persistence**: Simple JSON storage across languages
9. **Workflow Visualization**: Using Motia Workbench for system understanding
10. **Audit Logging**: Comprehensive event emission for system monitoring

This is a demonstration project for Motia workflow capabilities, showcasing modern backend patterns including CRUD operations, background job processing, and event-driven architecture.