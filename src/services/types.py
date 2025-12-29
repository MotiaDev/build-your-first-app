# src/services/types.py
from typing import TypedDict, Literal, Optional

Species = Literal['dog','cat','bird','other']
Status = Literal['new','in_quarantine','healthy','available','pending','adopted','ill','under_treatment','recovered','deleted']

class Pet(TypedDict, total=False):
    id: str
    name: str
    species: Species
    ageMonths: int
    status: Status
    createdAt: int
    updatedAt: int
    notes: str
    nextFeedingAt: int
    deletedAt: int
    purgeAt: int
