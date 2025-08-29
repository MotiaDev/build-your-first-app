from pydantic import BaseModel
from typing import List


class PetResponse(BaseModel):
    id: str
    name: str
    breed: str
    age: int


config = {
    "type": "api",
    "name": "GetPets",
    "description": "Get all pets in the store",
    "method": "GET",
    "path": "/pets",
    "emits": [],
    "responseSchema": {
        "200": {
            "type": "object",
            "properties": {
                "pets": {"type": "array", "items": PetResponse.model_json_schema()}
            },
            "required": ["pets"],
        }
    },
    "flows": ["api-endpoints-python"],
}


async def handler(req, context):
    context.logger.info("Retrieving all pets")

    # In a real app, you'd fetch from a database
    pets = [
        {"id": "1", "name": "Buddy", "breed": "Golden Retriever", "age": 3},
        {"id": "2", "name": "Max", "breed": "German Shepherd", "age": 5},
    ]

    return {"status": 200, "body": {"pets": pets}}
