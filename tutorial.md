# Pet Management Workflow Tutorial

This tutorial demonstrates how to build a comprehensive pet management system with Motia, featuring AI-driven decision making, workflow automation, and visible staff action triggers.

## Overview

The Pet Management System includes:
- Multi-language CRUD operations (TypeScript, JavaScript, Python)
- AI Profile Enrichment using OpenAI
- Agentic Decision Making for health and adoption reviews
- Visible Workflow Extensions with staff automation
- Event-driven architecture with proper guard enforcement

## Prerequisites

1. Start the Motia server:
```bash
npm start
```

2. Verify server is running (should see "Server running on port 3000")
3. Keep the server logs open to observe the workflow in action

## Tutorial Steps

### Step 1: Basic Pet Creation & Lifecycle

**Purpose**: Understand the automatic pet lifecycle progression

```bash
# Create a healthy pet
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Luna", "species": "cat", "ageMonths": 12}'

# Expected Response: {"id":"X","name":"Luna","species":"cat","ageMonths":12,"status":"new",...}
# Note the pet ID for subsequent commands

# Check pet status after creation
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status should be "in_quarantine" (automatic progression from "new")
# Observe in logs: Feeding reminder setup → AI profile enrichment started → Status: new → in_quarantine
```

### Step 2: AI Health Review - No Treatment Needed

**Purpose**: Test AI agent decision making for healthy pets

```bash
# Trigger health review on quarantined pet
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

# Check pet status after health review
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status should be "available" (in_quarantine → healthy → available)
# Observe in logs: 
# - Health review agent triggered
# - OpenAI API called and decision made
# - Orchestrator: Status updated in_quarantine → healthy
# - Automatic progression: healthy → available
```

### Step 3: AI Health Review - Treatment Required

**Purpose**: Test AI agent decision making for sick pets

```bash
# Create a pet with symptoms
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

# Manually set pet to healthy status (simulate initial assessment)
curl -X PUT http://localhost:3000/ts/pets/Y \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy"}'

# Trigger health review on symptomatic pet
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

# Check pet status progression
curl -X GET http://localhost:3000/ts/pets/Y

# Expected: Status should be "available" (healthy → ill → under_treatment → recovered → available)
# Observe in logs:
# - AI agent correctly identified symptoms
# - Orchestrator: Status updated healthy → ill
# - Orchestrator: Emitted ts.treatment.required
# - Treatment Scheduler: Treatment scheduled (if step exists)
# - Automatic progression through treatment stages
```

### Step 4: AI Adoption Review

**Purpose**: Test AI agent decision making for adoption readiness

```bash
# Trigger adoption review on available pet
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

# Check pet status
curl -X GET http://localhost:3000/ts/pets/X

# Expected: Status remains "available" (already available)
# Observe in logs:
# - Adoption review agent triggered
# - AI analyzed complete profile (bio, breed, temperament)
# - Orchestrator: Emitted ts.adoption.ready
# - Adoption Posting: Adoption listing created (if step exists)
```

### Step 5: Manual Status Transitions

**Purpose**: Test orchestrator guard enforcement and manual workflow control

```bash
# Try invalid transition (should be rejected)
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Expected Response: 
# {"message": "Status change request submitted", "currentStatus": "available", "requestedStatus": "adopted"}
# Check logs: "Transition rejected: Invalid transition from available to adopted"

# Valid transition - mark as pending adoption
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "pending"}'

# Expected: Status should change to "pending"
# Observe in logs: Orchestrator processed valid transition

# Complete adoption
curl -X PUT http://localhost:3000/ts/pets/X \
  -H "Content-Type: application/json" \
  -d '{"status": "adopted"}'

# Expected: Status should change to "adopted"
```

### Step 6: Treatment Recovery Flow

**Purpose**: Test the complete treatment and recovery workflow

```bash
# Create a pet and manually set to under_treatment
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Bella", "species": "dog", "ageMonths": 36}'

# Set to under_treatment status
curl -X PUT http://localhost:3000/ts/pets/Z \
  -H "Content-Type: application/json" \
  -d '{"status": "under_treatment"}'

# Mark treatment as completed
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

### Step 7: Error Handling & Edge Cases

**Purpose**: Test system resilience and guard enforcement

```bash
# Try health review on adopted pet (should be rejected)
curl -X POST http://localhost:3000/ts/pets/X/health-review

# Expected: Error message about invalid status

# Try adoption review on ill pet (should be rejected)
curl -X POST http://localhost:3000/ts/pets/Y/adoption-review

# Expected: Error message about invalid status

# Try to get non-existent pet
curl -X GET http://localhost:3000/ts/pets/999

# Expected: 404 error
```

### Step 8: Multi-Language Consistency

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

### Step 9: Workflow Visualization

**Purpose**: Observe the complete workflow in Motia Workbench

1. **Open Motia Workbench** in your browser
2. **Navigate to the Pet Management workflow**
3. **Observe visual connections**:
   - Agent steps connected to orchestrator
   - Orchestrator connected to staff action steps
   - Event flow arrows showing data movement
4. **Trigger events** and watch real-time updates
5. **Check step logs** to see detailed execution traces

## Expected Workflow Behavior Summary

| Test Scenario | AI Decision | Orchestrator Action | Staff Action Triggered |
|---------------|-------------|-------------------|----------------------|
| Healthy Pet Review | No Treatment Needed | Status: healthy → available | Adoption Posting |
| Sick Pet Review | Treatment Required | Status: healthy → ill → under_treatment | Treatment Scheduler |
| Adoption Review | Ready for Adoption | Status: available (unchanged) | Adoption Posting |
| Treatment Completion | Manual Update | Status: under_treatment → recovered | Recovery Monitor |
| Invalid Transition | N/A | Transition Rejected | No Action |

## Key Observations

1. **🤖 AI Intelligence**: Agents make contextual decisions based on pet data
2. **🔄 Orchestrator Control**: Central authority manages all status transitions
3. **📋 Staff Automation**: Each status change triggers specific staff tasks
4. **🛡️ Guard Enforcement**: Invalid transitions are properly rejected
5. **⚡ Automatic Progression**: Pets move through lifecycle stages automatically
6. **📊 Complete Audit**: Every decision and action is logged and traceable
7. **🌐 Language Parity**: Identical behavior across TypeScript, JavaScript, and Python

## Workflow Diagram

```
[AI Agents] → [Orchestrator] → [Staff Actions]
     ↓              ↓              ↓
Health Review → Status Update → Treatment Scheduler
Adoption Review → Status Update → Adoption Posting
Manual Update → Status Update → Recovery Monitor
```

## Key Concepts

### 🤖 AI Intelligence
AI agents make contextual decisions based on pet data, symptoms, and profiles. They choose from predefined actions and provide detailed rationale.

### 🔄 Orchestrator Control
Central authority manages all status transitions with guard enforcement. Ensures data integrity and business rule compliance.

### 📋 Staff Automation
Each status change triggers specific staff tasks like treatment scheduling, adoption posting, and recovery monitoring.

### 🛡️ Guard Enforcement
Invalid transitions are properly rejected with detailed error messages. Prevents data corruption and maintains workflow integrity.

## Conclusion

This comprehensive testing demonstrates how the pet management system transforms from a simple CRUD API into an intelligent workflow automation platform that guides staff through every step of pet care.

For more examples and advanced patterns, visit the [Motia Examples Repository](https://github.com/MotiaDev/motia-examples).
