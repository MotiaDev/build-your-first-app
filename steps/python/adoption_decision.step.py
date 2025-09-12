# steps/python/adoption_decision.step.py
config = { "type":"event", "name":"PyAdoptionDecision", "subscribes":["py.adoption.summary.ready"], "emits":["py.adoption.approved"], "flows":["adoptions"] }

async def handler(event, ctx=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        return {"success": False, "message": "Import error"}
    
    app_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")
    pet = pet_store.get(pet_id)
    if not pet:
        return

    pet_store.update(pet_id, {"status": "adopted"})

    logger = getattr(ctx, "logger", None)
    if logger: logger.info("Adoption approved, pet marked adopted", {"applicationId": app_id, "petId": pet_id})

    streams = getattr(ctx, "streams", None)
    trace_id = getattr(ctx, "traceId", None) or getattr(ctx, "trace_id", None)
    if streams and trace_id:
        await streams.adoptions.set(trace_id, "status", {
            "entityId": app_id, "type": "application", "phase": "approved"
        })
        await streams.adoptions.set(trace_id, "availability", {
            "entityId": pet_id, "type": "pet", "phase": "adopted", "message": "Pet adopted"
        })

    emit = getattr(ctx, "emit", None)
    if emit:
        await emit({"topic":"py.adoption.approved", "data":{"applicationId": app_id, "petId": pet_id, "TraceId": trace_id}})
