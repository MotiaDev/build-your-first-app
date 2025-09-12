# steps/python/adoption_summary.step.py
config = { "type":"event", "name":"PyAdoptionSummary", "subscribes":["py.adoption.checked"], "emits":["py.adoption.summary.ready"], "flows":["adoptions"] }

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

    message = (
        f"Application {app_id} for {pet['name']} the {pet['species']} looks good. Proceeding to approval."
        if pet else
        f"Application {app_id} looks good. Proceeding to approval."
    )

    logger = getattr(ctx, "logger", None)
    if logger: logger.info("Adoption summary generated", {"applicationId": app_id, "PetId": pet_id, "message": message})

    streams = getattr(ctx, "streams", None)
    trace_id = getattr(ctx, "traceId", None) or getattr(ctx, "trace_id", None)
    if streams and trace_id:
        await streams.adoptions.set(trace_id, "summary", {
            "entityId": app_id, "type": "application", "phase": "summary_ready", "message": message
        })

    emit = getattr(ctx, "emit", None)
    if emit:
        await emit({"topic":"py.adoption.summary.ready", "data":{"applicationId": app_id, "petId": pet_id, "message": message, "TraceId": trace_id}})
