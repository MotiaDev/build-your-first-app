# Pet Management System - Progressive Tutorial

**A Step-by-Step Tutorial: From Basic API to Streaming AI Agents**

This comprehensive tutorial demonstrates building an intelligent pet management system with Motia, progressively introducing concepts from simple REST APIs to advanced streaming AI agents. Each section builds upon the previous, showcasing real-world patterns across TypeScript, JavaScript, and Python.

---

## 📚 Tutorial Overview - 5 Progressive Levels

This tutorial is structured as a **progressive learning path** where each level adds complexity and demonstrates new Motia capabilities:

```
Level 1: API Endpoints          →  Basic CRUD operations
          ↓
Level 2: Background Jobs        →  Async processing (Queue + Cron)
          ↓
Level 3: Workflow Orchestrator  →  Centralized state management
          ↓
Level 4: AI Agents             →  Intelligent decision making
          ↓
Level 5: Streaming AI Agents   →  Real-time updates with SSE
```

### What You'll Build

By the end of this tutorial, you'll have a complete pet management system with:

- ✅ **RESTful APIs** - Full CRUD operations for pet records
- ✅ **Background Jobs** - Queue-based and scheduled async processing
- ✅ **Workflow Orchestration** - Automated lifecycle management with guard enforcement
- ✅ **AI Decision Making** - OpenAI-powered health and adoption reviews
- ✅ **Real-Time Streaming** - Server-Sent Events for live progress updates
- ✅ **Multi-Language Support** - Identical functionality in TypeScript, JavaScript, and Python

---

## 🎯 Tutorial Workflow Diagram

Here's the complete workflow you'll build throughout this tutorial:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEVEL 5: STREAMING AI AGENTS                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Real-Time SSE Stream Updates (pet-creation.stream)               │  │
│  │  ↓        ↓              ↓                    ↓                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
         ↓        ↓              ↓                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       LEVEL 4: AI AGENTS                                 │
│  ┌──────────────────┐    ┌──────────────────┐   ┌────────────────────┐ │
│  │ Health Review    │    │ Adoption Review  │   │ AI Profile         │ │
│  │ Agent            │    │ Agent            │   │ Enrichment         │ │
│  │ (OpenAI Decision)│    │ (OpenAI Decision)│   │ (OpenAI Content)   │ │
│  └────────┬─────────┘    └────────┬─────────┘   └─────────┬──────────┘ │
└───────────┼──────────────────────┼──────────────────────┼──────────────┘
            │                      │                       │
            ├──────────────────────┴───────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   LEVEL 3: WORKFLOW ORCHESTRATOR                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Pet Lifecycle Orchestrator (Centralized State Management)        │  │
│  │  • Transition Rules & Guards                                      │  │
│  │  • Status: new → in_quarantine → healthy → available → adopted   │  │
│  │  • Illness Flow: healthy → ill → under_treatment → recovered     │  │
│  └────────┬──────────────────────────────────────────────┬───────────┘  │
└───────────┼──────────────────────────────────────────────┼──────────────┘
            │                                               │
            ↓                                               ↓
┌───────────────────────────┐               ┌──────────────────────────────┐
│ Staff Action Automation   │               │ Automatic Progressions       │
│ • Treatment Scheduler     │               │ • healthy → available        │
│ • Adoption Posting        │               │ • ill → under_treatment      │
│ • Recovery Monitor        │               │ • recovered → healthy        │
└───────────────────────────┘               └──────────────────────────────┘
            ↑
┌─────────────────────────────────────────────────────────────────────────┐
│                     LEVEL 2: BACKGROUND JOBS                             │
│  ┌────────────────────────────┐      ┌──────────────────────────────┐   │
│  │ Queue-Based Job            │      │ Cron-Based Job               │   │
│  │ SetNextFeedingReminder     │      │ DeletionReaper               │   │
│  │ (Triggered by pet.created) │      │ (Runs daily at 2:00 AM)     │   │
│  └────────────┬───────────────┘      └──────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────────────────┘
                ↑
┌─────────────────────────────────────────────────────────────────────────┐
│                      LEVEL 1: API ENDPOINTS                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  REST API: /pets (CRUD Operations)                               │   │
│  │  • POST   /pets      → Create pet (emit pet.created)             │   │
│  │  • GET    /pets      → List all pets                             │   │
│  │  • GET    /pets/:id  → Get pet by ID                             │   │
│  │  • PUT    /pets/:id  → Update pet                                │   │
│  │  • DELETE /pets/:id  → Soft delete pet                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Features by Tutorial Level

### Level 1: API Endpoints
- Multi-language support (TypeScript, JavaScript, Python)
- RESTful API design with proper HTTP methods
- Request validation using Zod
- File-based JSON storage
- Standard error handling

### Level 2: Background Jobs
- **Queue-Based Jobs**: Event-triggered async processing
- **Cron-Based Jobs**: Scheduled maintenance tasks
- Soft delete pattern with 30-day retention
- Non-blocking API responses
- Event-driven job triggering

### Level 3: Workflow Orchestrator
- Centralized state management
- Automated lifecycle transitions
- Guard enforcement for valid transitions
- Staff decision points vs automatic progressions
- Status validation and rejection handling

### Level 4: AI Agents
- **AI Profile Enrichment**: Automatic pet profile generation using OpenAI
- **Health Review Agent**: AI-driven health assessments with emit selection
- **Adoption Review Agent**: AI-driven adoption readiness evaluation
- Structured decision artifacts with rationale
- Idempotent decision caching

### Level 5: Streaming AI Agents ⭐
- **Real-Time SSE Streaming**: Live progress updates during pet creation
- **Progressive Updates**: Stream messages as background jobs execute
- **AI Enrichment Streaming**: Real-time AI profile generation progress
- **Health Check Streaming**: Live quarantine and health status updates
- **Orchestrator Streaming**: Status transition notifications
- **Non-Blocking UX**: Immediate API response with ongoing updates

---

## 🚀 Getting Started

### Prerequisites

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
   
   **Get your OpenAI API key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key
   - Copy the key and add it to your environment

3. **Start Motia Server**
   ```bash
   npm run dev
   # or
   motia dev
   ```

4. **Open Workbench**
   - Navigate to Motia Workbench in your browser
   - Select the appropriate workflow (`TsPetManagement`, `JsPetManagement`, or `PyPetManagement`)
   - View the visual workflow diagram showing all steps and connections


---

## 📖 Level 1: API Endpoints - Basic CRUD

The foundation of our system is a RESTful API for pet management. This level demonstrates basic API design, validation, and data persistence.

### API Endpoints

All three languages provide identical CRUD functionality:

#### TypeScript Endpoints (`/ts/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ts/pets` | Create a new pet |
| GET | `/ts/pets` | List all pets |
| GET | `/ts/pets/:id` | Get pet by ID |
| PUT | `/ts/pets/:id` | Update pet |
| DELETE | `/ts/pets/:id` | Soft delete pet |

#### JavaScript Endpoints (`/js/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/js/pets` | Create a new pet |
| GET | `/js/pets` | List all pets |
| GET | `/js/pets/:id` | Get pet by ID |
| PUT | `/js/pets/:id` | Update pet |
| DELETE | `/js/pets/:id` | Soft delete pet |

#### Python Endpoints (`/py/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/py/pets` | Create a new pet |
| GET | `/py/pets` | List all pets |
| GET | `/py/pets/:id` | Get pet by ID |
| PUT | `/py/pets/:id` | Update pet |
| DELETE | `/py/pets/:id` | Soft delete pet |

### Pet Data Model

```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 24,
  "status": "new",
  "createdAt": 1640995200000,
  "updatedAt": 1640995200000,
  "weightKg": 15.5,
  "symptoms": ["coughing", "lethargy"],
  "notes": "Welcome to our pet store!",
  "nextFeedingAt": 1641081600000,
  "deletedAt": null,
  "purgeAt": null,
  "profile": {
    "bio": "Buddy is a friendly and energetic golden retriever...",
    "breedGuess": "Golden Retriever Mix",
    "temperamentTags": ["friendly", "energetic", "loyal"],
    "adopterHints": "Perfect for active families..."
  }
}
```

### Testing Level 1

```bash
# Create a pet
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buddy",
    "species": "dog",
    "ageMonths": 24
  }'

# List all pets
curl http://localhost:3000/ts/pets

# Get specific pet
curl http://localhost:3000/ts/pets/1

# Update pet
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"ageMonths": 25}'

# Soft delete pet
curl -X DELETE http://localhost:3000/ts/pets/1
```

---

## 📖 Level 2: Background Jobs - Async Processing

Building on Level 1, we add asynchronous background processing to handle time-consuming tasks without blocking API responses.

### Queue-Based Job: SetNextFeedingReminder

**Triggered by**: Creating a pet via any `POST /*/pets` endpoint

**Purpose**: Sets next feeding reminder and adds welcome notes after pet creation

**Process**:
1. Pet creation API completes immediately with `status: 201`
2. API emits language-specific event (e.g., `ts.feeding.reminder.enqueued`)
3. Background job picks up the event and processes asynchronously
4. Job adds welcome notes, calculates next feeding time, and sets status to `in_quarantine`
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

### Testing Level 2

```bash
# Create a pet and watch console for background job processing
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Whiskers", "species": "cat", "ageMonths": 12}'

# Check pet record after job completion (wait a few seconds)
curl http://localhost:3000/ts/pets/1

# Test soft delete
curl -X DELETE http://localhost:3000/ts/pets/1

# Verify pet is marked as deleted but still exists
curl http://localhost:3000/ts/pets/1
```

---

## 📖 Level 3: Workflow Orchestrator - Centralized State Management

Level 3 introduces a Pet Lifecycle Orchestrator that manages all status transitions through a realistic shelter workflow with guard enforcement.

### Core Architecture

**Centralized Control**: Only the orchestrator can modify `pet.status`. All other components emit events.

**Staff-Driven Workflow**: Status changes require staff decisions through the existing PUT API.

**Event-Driven**: Orchestrator subscribes to domain events and validates transition rules.

**Language Isolation**: Each language has its own orchestrator with language-specific event namespaces.

### Pet Lifecycle States

- `new` - Initial status when pet is created
- `in_quarantine` - Pet is in quarantine after feeding reminder setup
- `healthy` - Pet is healthy and cleared from quarantine
- `available` - Pet is ready for adoption
- `pending` - Adoption application in progress
- `adopted` - Pet has been adopted
- `ill` - Pet is identified as ill
- `under_treatment` - Pet is receiving medical treatment
- `recovered` - Pet has recovered from illness
- `deleted` - Pet is soft deleted (outside orchestrator)

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

### Workflow Flow

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
in_quarantine → ill (Staff finds illness)
healthy → ill (Staff assessment)
available → ill (Staff discovers illness)
↓ (AUTOMATIC - orchestrator starts treatment)
under_treatment
↓ (Staff marks recovered via PUT API)
recovered
↓ (AUTOMATIC - orchestrator clears recovery)
healthy
↓ (AUTOMATIC - orchestrator marks ready)
available
```

### Testing Level 3

```bash
# 1. Create a pet - starts with status=new, automatically moves to in_quarantine
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Buddy", "species": "dog", "ageMonths": 24}'

# 2. Check current status (should be in_quarantine after feeding reminder)
curl http://localhost:3000/ts/pets/1

# 3. Staff health check - clear from quarantine to healthy
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy"}'

# 4. Check status (should be available - automatic progression)
curl http://localhost:3000/ts/pets/1

# 5. Mark as ill
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "ill"}'

# 6. Check status (should be under_treatment - automatic progression)
curl http://localhost:3000/ts/pets/1
```

---

## 📖 Level 4: AI Agents - Intelligent Decision Making

Level 4 introduces AI-powered agents that make intelligent decisions based on pet context using OpenAI.

### Three Types of AI Agents

#### 1. AI Profile Enrichment (Non-Routing)

**Trigger**: Automatic on `pet.created` event

**Purpose**: Generate detailed pet profiles using AI

**AI-Generated Fields**:
- `bio` - Warm, engaging 2-3 sentence description
- `breedGuess` - AI's best guess at breed or breed mix
- `temperamentTags` - Array of 3-5 personality traits
- `adopterHints` - Practical advice for potential adopters

**Example Output**:
```json
{
  "profile": {
    "bio": "Luna is a graceful and independent cat with striking green eyes who enjoys sunny windowsills and gentle head scratches.",
    "breedGuess": "Domestic Shorthair",
    "temperamentTags": ["independent", "calm", "affectionate", "observant"],
    "adopterHints": "Ideal for singles or couples seeking a low-maintenance companion. Prefers quiet environments."
  }
}
```

#### 2. Health Review Agent (Routing)

**Endpoint**: `POST /ts/pets/:id/health-review`

**Purpose**: AI evaluates pet health and chooses appropriate action

**Available Decisions**:
- `emit.health.treatment_required` → Pet needs medical treatment
- `emit.health.no_treatment_needed` → Pet is healthy

**Decision Process**:
1. Analyze pet symptoms, age, species, current status
2. LLM chooses appropriate emit based on context
3. Provides structured rationale for decision
4. Orchestrator consumes emit and applies transitions

#### 3. Adoption Review Agent (Routing)

**Endpoint**: `POST /ts/pets/:id/adoption-review`

**Purpose**: AI evaluates adoption readiness

**Available Decisions**:
- `emit.adoption.needs_data` → Pet needs additional data
- `emit.adoption.ready` → Pet is ready for adoption

**Decision Artifact**:
```json
{
  "petId": "1",
  "agentType": "health-review",
  "timestamp": 1640995200000,
  "parsedDecision": {
    "chosenEmit": "emit.health.treatment_required",
    "rationale": "Pet shows concerning symptoms of coughing and lethargy that require veterinary evaluation."
  },
  "success": true
}
```

### Testing Level 4

```bash
# Test AI Profile Enrichment (automatic)
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Luna", "species": "cat", "ageMonths": 18}'

# Wait 2-3 seconds, then check for AI-generated profile
curl http://localhost:3000/ts/pets/1

# Test Health Review Agent with symptoms
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "dog",
    "ageMonths": 36,
    "symptoms": ["coughing", "lethargy", "fever"]
  }'

# Trigger health review
curl -X POST http://localhost:3000/ts/pets/2/health-review

# Test Adoption Review Agent
curl -X POST http://localhost:3000/ts/pets/1/adoption-review
```

---

## 📖 Level 5: Streaming AI Agents ⭐ - Real-Time Updates

**The Final Level**: Building on all previous levels, we add real-time streaming to provide immediate user feedback while background processes execute.

### What is Streaming?

Traditional APIs return a single response after all processing completes. With **Motia's native Streams API**, your API can return immediately with a stream that updates in real-time as background jobs, AI agents, and orchestrators process asynchronously.

### Streaming Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                                 │
│  POST /ts/pets { name: "Buddy", species: "dog", ageMonths: 24 } │
└───────────────────────────┬──────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│           CREATE PET API (Immediate Response)                     │
│  1. Validate request                                              │
│  2. Create pet record → status: "new"                            │
│  3. Initialize stream: streams.petCreation.set(traceId, ...)     │
│  4. Emit events: pet.created, feeding.reminder.enqueued          │
│  5. Return stream immediately (201 Created)                       │
└───────────────────────────┬──────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌─────────────────────────┐       ┌────────────────────────────────┐
│ FEEDING REMINDER JOB    │       │ AI PROFILE ENRICHMENT          │
│ (Background Stream      │       │ (Background Stream Updates)    │
│  Updates)               │       │                                │
│ 1. Stream: "Pet entered │       │ 1. Stream: "Enrichment started"│
│    quarantine"          │       │ 2. Call OpenAI API             │
│ 2. Check symptoms       │       │ 3. Stream: "Progress: bio"     │
│ 3. Stream: "Health      │       │ 4. Stream: "Progress: breed"   │
│    check passed/failed" │       │ 5. Stream: "Completed"         │
│ 4. Update status        │       │ 6. Update pet profile          │
│ 5. Emit completion      │       │ 7. Emit completion             │
└───────────┬─────────────┘       └────────────┬───────────────────┘
            ↓                                  ↓
┌────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (Stream Status Changes)              │
│  1. Listen for feeding.reminder.completed                      │
│  2. Stream: "Status: new → in_quarantine"                     │
│  3. Apply transition rules                                     │
│  4. Stream: "Status: in_quarantine → healthy"                 │
│  5. Stream: "Status: healthy → available"                     │
└────────────────────────────────────────────────────────────────┘
```

### Stream Configuration

The streaming feature is defined in `pet-creation.stream.ts`:

```typescript
import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'petCreation',
  schema: z.object({ 
    message: z.string()
  }),
  baseConfig: {
    storageType: 'default',
  },
}
```

This stream is available as `context.streams.petCreation` in all steps within the flow.

### How Streaming Works

#### 1. API Initializes Stream

```typescript
// create-pet.step.ts
const result = await streams.petCreation.set(traceId, 'message', { 
  message: `Pet ${pet.name} (ID: ${pet.id}) created successfully` 
});

return { 
  status: 201, 
  body: result  // Returns stream immediately
};
```

#### 2. Background Jobs Update Stream

```typescript
// set-next-feeding-reminder.job.step.ts
await streams.petCreation.set(traceId, 'message', { 
  message: `Pet ${pet.name} entered quarantine period` 
});

await streams.petCreation.set(traceId, 'message', { 
  message: `Health check passed for ${pet.name} - no symptoms found` 
});

await streams.petCreation.set(traceId, 'message', { 
  message: `${pet.name} is healthy and ready for adoption! ✅` 
});
```

#### 3. AI Enrichment Streams Progress

```typescript
// ai-profile-enrichment.step.ts
await streams.petCreation.set(traceId, 'enrichment_started', { 
  message: `AI enrichment started for ${pet.name}` 
});

await streams.petCreation.set(traceId, `progress_bio`, { 
  message: `Generated bio for ${pet.name}` 
});

await streams.petCreation.set(traceId, 'completed', { 
  message: `AI enrichment completed for ${pet.name}`,
  profile: generatedProfile
});
```

#### 4. Orchestrator Streams Transitions

```typescript
// pet-lifecycle-orchestrator.step.ts
await streams.petCreation.set(traceId, transitionTo, {
  message: `Status transition: ${currentStatus} → ${transitionTo}`,
  petId,
  timestamp: Date.now()
});
```

### Real-Time Stream Response

When you create a pet, the API returns a stream object immediately:

```json
{
  "streamId": "trace-abc123",
  "updates": [
    {
      "type": "message",
      "timestamp": 1640995200000,
      "data": {
        "message": "Pet Buddy (ID: 1) created successfully - Species: dog, Age: 24 months, Status: new"
      }
    }
  ]
}
```

As background jobs execute, the stream receives real-time updates:

```json
{
  "streamId": "trace-abc123",
  "updates": [
    {
      "type": "message",
      "timestamp": 1640995200000,
      "data": { "message": "Pet Buddy (ID: 1) created successfully..." }
    },
    {
      "type": "message",
      "timestamp": 1640995201500,
      "data": { "message": "Pet Buddy entered quarantine period" }
    },
    {
      "type": "message",
      "timestamp": 1640995203000,
      "data": { "message": "Health check passed for Buddy - no symptoms found" }
    },
    {
      "type": "enrichment_started",
      "timestamp": 1640995201000,
      "data": { "message": "AI enrichment started for Buddy" }
    },
    {
      "type": "progress_bio",
      "timestamp": 1640995202500,
      "data": { "message": "Generated bio for Buddy" }
    },
    {
      "type": "completed",
      "timestamp": 1640995204000,
      "data": { 
        "message": "AI enrichment completed for Buddy",
        "profile": { "bio": "...", "breedGuess": "...", ... }
      }
    },
    {
      "type": "message",
      "timestamp": 1640995205000,
      "data": { "message": "Buddy is healthy and ready for adoption! ✅" }
    }
  ]
}
```

### Testing Level 5 - Streaming

#### Test 1: Basic Streaming (Healthy Pet)

```bash
# Create a healthy pet without symptoms
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luna",
    "species": "cat",
    "ageMonths": 18
  }'
```

**Expected Stream Updates**:
1. ✅ "Pet Luna (ID: X) created successfully"
2. 🔄 "Pet Luna entered quarantine period"
3. 🤖 "AI enrichment started for Luna"
4. 📝 "Generated bio for Luna"
5. 📝 "Generated breed guess for Luna"
6. ✅ "AI enrichment completed for Luna"
7. ✅ "Health check passed for Luna - no symptoms found"
8. ✅ "Luna is healthy and ready for adoption! ✅"

#### Test 2: Streaming with Symptoms (Sick Pet)

```bash
# Create a pet with symptoms
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "dog",
    "ageMonths": 36,
    "symptoms": ["coughing", "lethargy", "fever"],
    "weightKg": 25.5
  }'
```

**Expected Stream Updates**:
1. ✅ "Pet Max (ID: X) created successfully"
2. 🔄 "Pet Max entered quarantine period"
3. 🤖 "AI enrichment started for Max"
4. 📝 AI profile generation progress updates
5. ✅ "AI enrichment completed for Max"
6. ⚠️ "Health check failed for Max - symptoms detected: coughing, lethargy, fever"
7. ❌ "Max needs medical treatment ❌"

#### Test 3: Monitor Stream in Real-Time

You can also fetch the stream directly to see updates:

```bash
# Get stream updates (replace STREAM_ID with actual streamId from response)
curl http://localhost:3000/streams/STREAM_ID
```

### Benefits of Streaming

| Traditional API | Streaming API |
|----------------|---------------|
| ⏳ Wait for all processing | ✅ Immediate response |
| 🤷 No progress visibility | 📊 Real-time progress updates |
| ❌ Timeout on long operations | ✅ No timeout issues |
| 😴 Poor user experience | 😊 Engaging user experience |
| 🔇 Silent background jobs | 📢 Visible workflow execution |

### Real-World Use Cases

1. **Order Processing**: Show shipping, payment, fulfillment status in real-time
2. **Document Generation**: Stream progress as AI generates reports/documents
3. **Data Import**: Show validation, processing, completion status
4. **ML Model Training**: Stream training progress, metrics, completion
5. **Video Processing**: Stream transcoding, quality checks, upload progress

---

## 🖼️ Workbench Screenshot

### Complete Workflow Visualization

The Motia Workbench provides a visual representation of the entire workflow showing all 5 levels:

![Pet Management Workflow - Complete System Architecture](https://github.com/user-attachments/assets/e73af57b-c3c9-4c08-ae71-5e3dc37e5992)

**This screenshot shows the complete TsPetManagement workflow including:**

1. **API Steps** (Left side) - Create, Read, Update, Delete operations
2. **Background Jobs** - `set-next-feeding-reminder` (queue-based), `deletion-reaper` (cron-based)
3. **Orchestrator** (Center) - `pet-lifecycle-orchestrator` managing all state transitions
4. **AI Agents** - `health-review-agent`, `adoption-review-agent`, `ai-profile-enrichment`
5. **Stream** ⭐ - `pet-creation.stream` providing real-time SSE updates
6. **Staff Actions** - `treatment-scheduler`, `adoption-posting`, `recovery-monitor`
7. **Event Connections** - Visual arrows showing data flow between all components

The diagram clearly visualizes how the progressive tutorial builds from simple APIs (Level 1) through background jobs (Level 2), orchestration (Level 3), AI agents (Level 4), and finally streaming (Level 5).

---

## 📁 File Structure

```
steps/
├── javascript/
│   ├── create-pet.step.js              # POST /js/pets (with streaming)
│   ├── get-pets.step.js                # GET /js/pets
│   ├── get-pet.step.js                 # GET /js/pets/:id
│   ├── update-pet.step.js              # PUT /js/pets/:id
│   ├── delete-pet.step.js              # DELETE /js/pets/:id
│   ├── set-next-feeding-reminder.job.step.js  # Background job (streams updates)
│   ├── deletion-reaper.cron.step.js    # Cron job (daily cleanup)
│   ├── pet-lifecycle-orchestrator.step.js     # Workflow orchestrator (streams transitions)
│   ├── ai-profile-enrichment.step.js   # AI profile generation (streams progress)
│   ├── health-review-agent.step.js     # POST /js/pets/:id/health-review
│   ├── adoption-review-agent.step.js   # POST /js/pets/:id/adoption-review
│   ├── treatment-scheduler.step.js     # Staff action automation
│   ├── adoption-posting.step.js        # Staff action automation
│   ├── recovery-monitor.step.js        # Staff action automation
│   ├── pet-creation.stream.js          # Stream configuration ⭐
│   └── js-store.js                     # Data persistence layer
│
├── typescript/
│   ├── create-pet.step.ts              # POST /ts/pets (with streaming)
│   ├── get-pets.step.ts                # GET /ts/pets
│   ├── get-pet.step.ts                 # GET /ts/pets/:id
│   ├── update-pet.step.ts              # PUT /ts/pets/:id
│   ├── delete-pet.step.ts              # DELETE /ts/pets/:id
│   ├── set-next-feeding-reminder.job.step.ts  # Background job (streams updates)
│   ├── deletion-reaper.cron.step.ts    # Cron job (daily cleanup)
│   ├── pet-lifecycle-orchestrator.step.ts     # Workflow orchestrator (streams transitions)
│   ├── ai-profile-enrichment.step.ts   # AI profile generation (streams progress)
│   ├── health-review-agent.step.ts     # POST /ts/pets/:id/health-review
│   ├── adoption-review-agent.step.ts   # POST /ts/pets/:id/adoption-review
│   ├── treatment-scheduler.step.ts     # Staff action automation
│   ├── adoption-posting.step.ts        # Staff action automation
│   ├── recovery-monitor.step.ts        # Staff action automation
│   ├── pet-creation.stream.ts          # Stream configuration ⭐
│   ├── agent-decision-framework.ts     # Shared agent decision logic
│   └── ts-store.ts                     # Data persistence layer
│
├── python/
│   ├── create_pet_step.py              # POST /py/pets (with streaming)
│   ├── get_pets_step.py                # GET /py/pets
│   ├── get_pet_step.py                 # GET /py/pets/:id
│   ├── update_pet_step.py              # PUT /py/pets/:id
│   ├── delete_pet_step.py              # DELETE /py/pets/:id
│   ├── set_next_feeding_reminder.job_step.py  # Background job (streams updates)
│   ├── deletion_reaper.cron_step.py    # Cron job (daily cleanup)
│   ├── pet_lifecycle_orchestrator_step.py     # Workflow orchestrator (streams transitions)
│   ├── ai_profile_enrichment_step.py   # AI profile generation (streams progress)
│   ├── health_review_agent_step.py     # POST /py/pets/:id/health-review
│   ├── adoption_review_agent_step.py   # POST /py/pets/:id/adoption-review
│   ├── treatment_scheduler_step.py     # Staff action automation
│   ├── adoption_posting_step.py        # Staff action automation
│   ├── recovery_monitor_step.py        # Staff action automation
│   ├── pet_creation.stream.py          # Stream configuration ⭐
│   └── services/
│       ├── pet_store.py                # Data persistence layer
│       └── types.py                    # Type definitions
│
└── motia-workbench.json                # Workflow configuration
```

---

## 🎓 Complete Tutorial Walkthrough

Follow this step-by-step guide to experience all 5 levels in sequence:

### Step 1: Basic Pet Creation (Levels 1-2)

```bash
# Create a healthy pet
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Buddy", "species": "dog", "ageMonths": 24}'

# Expected: Immediate API response with stream
# Expected: Background job processes feeding reminder (watch console)
# Expected: AI enrichment generates profile (watch console)
```

### Step 2: Verify Streaming Updates (Level 5)

```bash
# Get the pet to see final state
curl http://localhost:3000/ts/pets/1

# Expected: Pet with status "available", complete profile, notes, nextFeedingAt
```

### Step 3: Test Orchestrator (Level 3)

```bash
# Try invalid transition
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Expected: Transition rejected (can't go directly from available to adopted)

# Valid transition: pending adoption
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# Valid transition: complete adoption
curl -X PUT http://localhost:3000/ts/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'
```

### Step 4: Test AI Health Review (Level 4)

```bash
# Create a pet with symptoms
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "species": "dog",
    "ageMonths": 36,
    "symptoms": ["coughing", "lethargy", "fever"],
    "weightKg": 25.5
  }'

# Wait for pet to reach "healthy" or "available" status
# Then trigger AI health review
curl -X POST http://localhost:3000/ts/pets/2/health-review

# Expected: AI agent chooses "treatment_required"
# Expected: Orchestrator automatically transitions: healthy → ill → under_treatment
```

### Step 5: Test AI Adoption Review (Level 4)

```bash
# Trigger adoption review on available pet
curl -X POST http://localhost:3000/ts/pets/2/adoption-review

# Expected: AI agent evaluates readiness
# Expected: Decision artifact with rationale
```

### Step 6: Test Multi-Language Parity

```bash
# Test JavaScript implementation
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "JS_Pet", "species": "cat", "ageMonths": 12}'

curl -X POST http://localhost:3000/js/pets/1/health-review

# Test Python implementation
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Py_Pet", "species": "bird", "ageMonths": 6}'

curl -X POST http://localhost:3000/py/pets/1/health-review

# Expected: Identical behavior across all three languages
```

---

## 🔑 Key Learning Points

This progressive tutorial demonstrates:

### Level 1 - API Endpoints
✅ RESTful API design with proper HTTP methods  
✅ Request validation using Zod  
✅ File-based data persistence  
✅ Multi-language implementation (TypeScript, JavaScript, Python)  

### Level 2 - Background Jobs
✅ Queue-based jobs (event-triggered)  
✅ Cron-based jobs (scheduled)  
✅ Non-blocking API responses  
✅ Event-driven job triggering  
✅ Soft delete pattern with cleanup  

### Level 3 - Workflow Orchestrator
✅ Centralized state management  
✅ Guard enforcement for valid transitions  
✅ Automatic progressions vs staff decisions  
✅ Status validation and rejection handling  
✅ Event-driven workflow control  

### Level 4 - AI Agents
✅ AI Profile Enrichment (content generation)  
✅ Agentic Decision Making (routing decisions)  
✅ Structured decision artifacts with rationale  
✅ Idempotent decision caching  
✅ OpenAI integration patterns  

### Level 5 - Streaming AI Agents ⭐
✅ **Real-time Server-Sent Events (SSE)**  
✅ **Progressive updates during async processing**  
✅ **Stream initialization and management**  
✅ **Multi-step workflow streaming**  
✅ **Non-blocking user experience**  
✅ **Visible workflow execution**  

---

## 🎯 Tutorial Objectives Achieved

By completing this tutorial, you've learned:

1. **Progressive Complexity**: How to build from simple APIs to advanced streaming AI agents
2. **Motia Patterns**: API steps, event steps, cron steps, streams, and agent patterns
3. **Real-World Architecture**: Orchestrators, background jobs, AI integration, streaming
4. **Multi-Language Development**: Identical functionality across TypeScript, JavaScript, Python
5. **Production-Ready Features**: Validation, error handling, idempotency, guard enforcement
6. **Modern UX**: Real-time feedback and progressive updates

---

## 🚀 Next Steps

Now that you've completed the tutorial, you can:

1. **Customize the Workflow**: Add your own status states and transition rules
2. **Extend AI Agents**: Create new agent endpoints with custom decision logic
3. **Add More Streams**: Implement streaming in other workflows
4. **Build Your Own**: Apply these patterns to your own domain and use cases
5. **Explore Motia Docs**: Learn about advanced features and patterns

---

## 📚 Additional Resources

- [Motia Documentation](https://www.motia.dev/docs)
- [Motia Examples Repository](https://github.com/MotiaDev/motia-examples)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Server-Sent Events (SSE) Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

## 🤝 Contributing

This is a demonstration project for Motia workflow capabilities. Feel free to use it as a template for your own projects!

---

**Built with ❤️ using Motia - The Modern Workflow Platform**
