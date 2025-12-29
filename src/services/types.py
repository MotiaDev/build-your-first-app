# steps/services/types.py
from typing import TypedDict, Literal, Optional, List

Species = Literal['dog','cat','bird','other']
Status = Literal['new','in_quarantine','healthy','available','pending','adopted','ill','under_treatment','recovered','deleted']

class PetProfile(TypedDict):
    bio: str
    breedGuess: str
    temperamentTags: List[str]
    adopterHints: str

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
    profile: PetProfile
