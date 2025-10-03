# steps/python/delete_pet.step.py
config = { "type":"api", "name":"PyDeletePet", "path":"/py/pets/:id", "method":"DELETE", "emits": [], "flows": ["PyPetManagement"] }

async def handler(req, _ctx=None):
    try:
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    pid = req.get("pathParams", {}).get("id")
    ok = pet_store.remove(pid)
    return {"status": 204, "body": {}} if ok else {"status": 404, "body": {"message":"Not found"}}
