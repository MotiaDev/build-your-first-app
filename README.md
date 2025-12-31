# Pet Store CRUD API

A multi-language pet management system built with Motia, demonstrating basic CRUD operations and event-driven logging across TypeScript, JavaScript, and Python implementations.

## Features

- **Multi-language Support**: Complete implementations in TypeScript, JavaScript, and Python
- **Pet Management**: Full CRUD operations for pet records
- **Event-Driven Logging**: Creates events for tracking pet operations
- **File-based Storage**: JSON persistence across all implementations
- **Language Parity**: Identical functionality across all three languages
- **RESTful APIs**: Standard HTTP methods for all operations

## Architecture

### Workflow Organization

The system uses a single workflow definition in `motia-workbench.json`:

- `"pets"` - Complete pet management operations for all languages

The workflow includes all CRUD steps positioned by language:
- **JavaScript**: `/js/pets` endpoints
- **TypeScript**: `/ts/pets` endpoints  
- **Python**: `/py/pets` endpoints

### Pet Data Model

Each pet has the following structure:

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

**Status Values:**
- `"new"` - Default status when pet is created
- `"available"` - Pet is available for adoption
- `"pending"` - Adoption application in progress
- `"adopted"` - Pet has been adopted

**Species Values:** `"dog"`, `"cat"`, `"bird"`, `"other"`

## API Endpoints

All three languages provide identical CRUD functionality:

### JavaScript Endpoints (`/js/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/js/pets` | Create a new pet |
| GET | `/js/pets` | List all pets |
| GET | `/js/pets/:id` | Get pet by ID |
| PUT | `/js/pets/:id` | Update pet |
| DELETE | `/js/pets/:id` | Delete pet |

### TypeScript Endpoints (`/ts/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ts/pets` | Create a new pet |
| GET | `/ts/pets` | List all pets |
| GET | `/ts/pets/:id` | Get pet by ID |
| PUT | `/ts/pets/:id` | Update pet |
| DELETE | `/ts/pets/:id` | Delete pet |

### Python Endpoints (`/py/pets`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/py/pets` | Create a new pet |
| GET | `/py/pets` | List all pets |
| GET | `/py/pets/:id` | Get pet by ID |
| PUT | `/py/pets/:id` | Update pet |
| DELETE | `/py/pets/:id` | Delete pet |

## Usage Examples

### Create a Pet

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

**Response:**
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

**Events Emitted:**
- Topic: `pet.created`
- Data: `{ petId: "1", name: "Buddy", species: "dog" }`

### List All Pets

**Request:**
```bash
curl http://localhost:3000/js/pets
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "Buddy",
    "species": "dog",
    "ageMonths": 24,
    "status": "new",
    "createdAt": 1640995200000,
    "updatedAt": 1640995200000
  }
]
```

### Get Pet by ID

**Request:**
```bash
curl http://localhost:3000/js/pets/1
```

**Response:**
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

### Update Pet

**Request:**
```bash
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "available",
    "ageMonths": 25
  }'
```

**Response:**
```json
{
  "id": "1",
  "name": "Buddy",
  "species": "dog",
  "ageMonths": 25,
  "status": "available",
  "createdAt": 1640995200000,
  "updatedAt": 1640995300000
}
```

### Delete Pet

**Request:**
```bash
curl -X DELETE http://localhost:3000/js/pets/1
```

**Response:**
```
204 No Content
```

## Event System

The system emits events for tracking and logging purposes:

### pet.created

Emitted when a new pet is created via any `POST /*/pets` endpoint.

**Data:**
```json
{
  "petId": "1",
  "name": "Buddy", 
  "species": "dog"
}
```

**Console Output:**
```
🐾 Pet created { petId: '1', name: 'Buddy', species: 'dog', status: 'new' }
```

## File Structure

```
src/
├── javascript/
│   ├── create-pet.step.js      # POST /js/pets
│   ├── get-pets.step.js        # GET /js/pets
│   ├── get-pet.step.js         # GET /js/pets/:id
│   ├── update-pet.step.js      # PUT /js/pets/:id
│   ├── delete-pet.step.js      # DELETE /js/pets/:id
│   └── js-store.js             # Data persistence layer
├── typescript/
│   ├── create-pet.step.ts      # POST /ts/pets
│   ├── get-pets.step.ts        # GET /ts/pets
│   ├── get-pet.step.ts         # GET /ts/pets/:id
│   ├── update-pet.step.ts      # PUT /ts/pets/:id
│   ├── delete-pet.step.ts      # DELETE /ts/pets/:id
│   └── ts-store.ts             # Data persistence layer
├── python/
│   ├── create_pet_step.py      # POST /py/pets
│   ├── get_pets_step.py        # GET /py/pets
│   ├── get_pet_step.py         # GET /py/pets/:id
│   ├── update_pet_step.py      # PUT /py/pets/:id
│   └── delete_pet_step.py      # DELETE /py/pets/:id
└── services/
    ├── pet_store.py            # Data persistence layer (Python)
    └── types.py                # Type definitions (Python)
motia-workbench.json            # Workflow configuration
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
      "updatedAt": 1640995200000
    }
  }
}
```

## Testing Examples

### JavaScript Testing

```bash
# Create a pet
curl -X POST http://localhost:3000/js/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Whiskers", "species": "cat", "ageMonths": 12}'

# List all pets
curl http://localhost:3000/js/pets

# Update pet status
curl -X PUT http://localhost:3000/js/pets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "available"}'
```

### TypeScript Testing

```bash
# Create a pet
curl -X POST http://localhost:3000/ts/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "species": "bird", "ageMonths": 6}'

# Get specific pet
curl http://localhost:3000/ts/pets/1
```

### Python Testing

```bash
# Create a pet
curl -X POST http://localhost:3000/py/pets \
  -H "Content-Type: application/json" \
  -d '{"name": "Rex", "species": "dog", "ageMonths": 36}'

# Delete pet
curl -X DELETE http://localhost:3000/py/pets/1
```

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
- `status`: Optional, must be one of: `"new"`, `"available"`, `"pending"`, `"adopted"`

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
   - View all CRUD operations for all three languages

4. **Test APIs**
   - Use the provided curl examples
   - Monitor console output for event logs
   - Check `.data/pets.json` for data persistence

## Key Learning Points

This example demonstrates:

1. **Multi-language Implementation**: Same functionality in TypeScript, JavaScript, and Python
2. **RESTful API Design**: Standard HTTP methods and response codes
3. **Event-Driven Architecture**: Emitting events for system integration
4. **Data Validation**: Input validation and error handling
5. **File-based Persistence**: Simple JSON storage across languages
6. **Workflow Visualization**: Using Motia Workbench for system understanding

This is a demonstration project for Motia workflow capabilities.