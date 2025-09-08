# steps/python/create_pet.step.py
config = {
    "type": "api",
    "name": "PyCreatePet",
    "path": "/py/pets",
    "method": "POST",
    "emits": []
}

async def handler(req, ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        # Fallback for import issues
        return {"status": 500, "body": {"message": "Import error"}}
    
    b = (req.get("body") or {})
    name = b.get("name")
    species = b.get("species")
    age = b.get("ageMonths")
    if not isinstance(name, str) or not name.strip():
        return {"status": 400, "body": {"message": "Invalid name"}}
    if species not in ["dog","cat","bird","other"]:
        return {"status": 400, "body": {"message": "Invalid species"}}
    try:
        age_val = int(age)
    except Exception:
        return {"status": 400, "body": {"message": "Invalid ageMonths"}}
    pet = pet_store.create(name, species, age_val)
    return {"status": 201, "body": pet}
