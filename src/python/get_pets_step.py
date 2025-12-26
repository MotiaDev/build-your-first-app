# src/python/get_pets.step.py
config = { "type":"api", "name":"PyListPets", "path":"/py/pets", "method":"GET", "emits": [], "flows": ["PyPetManagement"] }

async def handler(_req, _ctx=None):
    try:
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
        from src.services.pet_store import pet_store
    except ImportError as e:
        return {"status": 500, "body": {"message": e}}
    return {"status": 200, "body": pet_store.list_all()}
