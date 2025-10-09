# steps/python/get_pet.step.py
config = { "type":"api", "name":"PyGetPet", "path":"/py/pets/:id", "method":"GET", "emits": [], "flows": ["PyPetManagement"] }

async def handler(req, _ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    pid = req.get("pathParams", {}).get("id")
    pet = pet_store.get(pid)
    return {"status": 200, "body": pet} if pet else {"status": 404, "body": {"message": "Not found"}}
