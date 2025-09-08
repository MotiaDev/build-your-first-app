# steps/python/adoptions_approve.step.py
config = { "type":"api", "name":"PyApproveAdoption", "path":"/py/adoptions/approve", "method":"POST", "emits":["adoption.approved"], "flows":["pets"] }

async def handler(req, ctx=None):
    from ..services import pet_store
    pet_id = str((req.get("body") or {}).get("petId") or "")
    pet = pet_store.get(pet_id)
    if not pet:
        return {"status": 404, "body": {"message": "Pet not found"}}
    pet_store.update(pet_id, {"status": "adopted"})
    emitter = (ctx or {}).get("emit")
    if emitter:
        await emitter({ "topic":"adoption.approved", "data": { "applicationId": f"app-{pet_id}", "petId": pet_id } })
    logger = (ctx or {}).get("logger")
    if logger: logger.info("Adoption approved", {"petId": pet_id})
    return {"status": 200, "body": {"ok": True, "petId": pet_id}}
