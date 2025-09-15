# steps/python/jobs_feeding_daily.step.py
config = { "type":"cron", "name":"PyDailyFeeding", "cron":"30 2 * * *", "emits":[], "flows":["pets_management"] }

async def handler(ctx, logger=None):
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from services import pet_store
    except ImportError:
        print("Import error in feeding job")
        return {"success": False}
    lg = (logger or (ctx or {}).get("logger"))
    for p in pet_store.list_all():
        if p.get('status') != 'adopted':
            if lg: lg.info("Feeding reminder", {"id": p["id"], "name": p["name"]})
