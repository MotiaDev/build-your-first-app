# steps/python/jobs_feeding_daily.step.py
config = { "type":"cron", "name":"PyDailyFeeding", "cron":"30 2 * * *", "emits":[], "flows":["pets"] }

async def handler(ctx, logger=None):
    from ..services import pet_store
    lg = (logger or (ctx or {}).get("logger"))
    for p in pet_store.list_all():
        if p.get('status') != 'adopted':
            if lg: lg.info("Feeding reminder", {"id": p["id"], "name": p["name"]})
