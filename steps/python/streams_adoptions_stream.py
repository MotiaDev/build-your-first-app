# steps/python/streams_adoptions_stream.step.py
config = {
    "name": "adoptions",
    "schema": {
        "entityId": "string",
        "type": ["application", "pet"],
        "phase": "string",
        "message": "string?"
    },
    "baseConfig": { "storageType": "default" }
}
