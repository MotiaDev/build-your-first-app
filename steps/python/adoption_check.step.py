# steps/python/adoption_check.step.py
config = { "type":"event", "name":"PyAdoptionCheck", "subscribes":["py.adoption.applied"], "emits":["py.adoption.checked"], "flows":["adoptions"] }

async def handler(event, ctx=None):
    app_id = (event or {}).get("applicationId")
    pet_id = (event or {}).get("petId")

    logger = getattr(ctx, "logger", None)
    if logger: logger.info("Background check complete", {"applicationId": app_id, "petId": pet_id})

    streams = getattr(ctx, "streams", None)
    trace_id = getattr(ctx, "traceId", None) or getattr(ctx, "trace_id", None)
    if streams and trace_id:
        await streams.adoptions.set(trace_id, "status", {
            "entityId": app_id, "type": "application", "phase": "checked"
        })

    emit = getattr(ctx, "emit", None)
    if emit:
        await emit({"topic":"py.adoption.checked", "data":{"applicationId": app_id, "petId": pet_id, "traceId": trace_id}})
