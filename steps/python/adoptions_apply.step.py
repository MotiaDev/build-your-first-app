# steps/python/adoptions_apply.step.py
config = { "type":"api", "name":"PyAdoptionApply", "path":"/py/adoptions/apply", "method":"POST", "emits":["py.adoption.applied"], "flows":["adoptions"] }

async def handler(req, ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"status": 500, "body": {"message": "Import error"}}
    
    b = (req.get("body") or {})
    pet_id = str(b.get("petId") or "")
    pet = pet_store.get(pet_id)
    if not pet:
        return {"status": 404, "body": {"message": "Pet not found"}}
    if pet.get("status") == "adopted":
        return {"status": 409, "body": {"message": "Pet already adopted"}}

    import time
    application_id = f"app-{time.time_ns()}"

    logger = getattr(ctx, "logger", None)
    if logger: logger.info("Application received", {"applicationId": application_id, "petId": pet_id})

    streams = getattr(ctx, "streams", None)
    trace_id = getattr(ctx, "traceId", None) or getattr(ctx, "trace_id", None)

    record = None
    if streams and trace_id:
        record = await streams.adoptions.set(trace_id, "status", {
            "entityId": application_id, "type": "application", "phase": "applied"
        })

    emit = getattr(ctx, "emit", None)
    if emit:
        await emit({"topic":"py.adoption.applied", "data":{"applicationId": application_id, "petId": pet_id, "traceId": trace_id}})

    return {"status": 202, "body": record or {"entityId": application_id, "type":"application", "phase":"applied"}}
