# steps/services/types.py
from typing import TypedDict, Literal, Optional

Species = Literal['dog','cat','bird','other']
Status = Literal['new','available','pending','adopted']

class Pet(TypedDict, total=False):
    id: str
    name: str
    species: Species
    ageMonths: int
    status: Status
    createdAt: int
    updatedAt: int
