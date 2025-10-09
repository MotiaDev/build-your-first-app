# steps/python/get_pets.step.py
config = { "type":"api", "name":"PyListPets", "path":"/py/pets", "method":"GET", "emits": [], "flows": ["PyPetManagement"] }

async def handler(_req, _ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    return {"status": 200, "body": pet_store.list_all()}
