# steps/python/update_pet.step.py
config = { "type":"api", "name":"PyUpdatePet", "path":"/py/pets/:id", "method":"PUT", "emits": [], "flows": ["PyPetManagement"] }

async def handler(req, _ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from src.services.pet_store import update
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    pid = req.get("pathParams", {}).get("id")
    b = (req.get("body") or {})
    patch = {}
    if isinstance(b.get("name"), str): patch["name"] = b["name"]
    if b.get("species") in ["dog","cat","bird","other"]: patch["species"] = b["species"]
    if isinstance(b.get("ageMonths"), (int, float, str)):
        try: patch["ageMonths"] = int(b["ageMonths"])
        except Exception: pass
    if b.get("status") in ["new","available","pending","adopted","deleted"]: patch["status"] = b["status"]
    updated = update(pid, patch)
    return {"status": 200, "body": updated} if updated else {"status": 404, "body": {"message":"Not found"}}
