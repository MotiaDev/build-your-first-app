# steps/python/adoptions_apply.step.py
config = { "type":"api", "name":"PyAdoptionApply", "path":"/py/adoptions/apply", "method":"POST", "emits":["py.adoption.applied"], "flows":["python-adoptions"] }

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
    adopter_name = str(b.get("adopterName") or "")
    adopter_email = str(b.get("adopterEmail") or "")
    
    # Validate required fields
    if not pet_id:
        return {"status": 400, "body": {"message": "petId is required"}}
    if not adopter_name:
        return {"status": 400, "body": {"message": "adopterName is required"}}
    if not adopter_email:
        return {"status": 400, "body": {"message": "adopterEmail is required"}}
    
    pet = pet_store.get(pet_id)
    if not pet:
        return {"status": 404, "body": {"message": "Pet not found"}}
    if pet.get("status") == "adopted":
        return {"status": 409, "body": {"message": "Pet already adopted"}}

    import time
    application_id = f"app-{int(time.time() * 1000)}"

    if ctx and ctx.logger:
        ctx.logger.info("📋 Adoption application received", {
            "applicationId": application_id,
            "petId": pet_id,
            "petName": pet.get("name"),
            "adopterName": adopter_name,
            "adopterEmail": adopter_email
        })

    record = None
    if ctx and hasattr(ctx, 'streams') and ctx.streams and ctx.trace_id:
        record = await ctx.streams.adoptions.set(ctx.trace_id, "status", {
            "entityId": application_id,
            "type": "application",
            "phase": "applied",
            "message": f"{adopter_name} applied to adopt {pet.get('name', 'pet')}",
            "timestamp": int(time.time() * 1000),
            "data": {
                "petId": pet_id,
                "petName": pet.get("name"),
                "petSpecies": pet.get("species"),
                "adopterName": adopter_name,
                "adopterEmail": adopter_email
            }
        })

    if ctx and hasattr(ctx, 'emit'):
        await ctx.emit({
            "topic": "py.adoption.applied",
            "data": {
                "applicationId": application_id,
                "petId": pet_id,
                "adopterName": adopter_name,
                "adopterEmail": adopter_email,
                "traceId": ctx.trace_id
            }
        })

    return {
        "status": 202,
        "body": record or {
            "entityId": application_id,
            "type": "application",
            "phase": "applied",
            "traceId": ctx.trace_id if ctx else None
        }
    }
