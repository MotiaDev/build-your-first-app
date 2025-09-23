# steps/services/pet_store.py
import json
import os
import time
from typing import Dict, Optional, List, TypedDict
try:
    from .types import Pet
except ImportError:
    import sys
    sys.path.append(os.path.dirname(__file__))
    from types import Pet

DATA_DIR = os.path.join(os.getcwd(), '.data')
FILE = os.path.join(DATA_DIR, 'pets.json')

class DbShape(TypedDict):
    seq: int
    pets: Dict[str, Pet]

def ensure_file() -> None:
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FILE):
        init: DbShape = {'seq': 1, 'pets': {}}
        with open(FILE, 'w') as f:
            json.dump(init, f)

def load() -> DbShape:
    ensure_file()
    with open(FILE, 'r') as f:
        return json.load(f)

def save(db: DbShape) -> None:
    with open(FILE, 'w') as f:
        json.dump(db, f)

def _now() -> int:
    return int(time.time() * 1000)

def create(name: str, species: str, ageMonths: int) -> Pet:
    db = load()
    pid = str(db['seq'])
    db['seq'] += 1
    pet: Pet = {
        'id': pid,
        'name': name.strip(),
        'species': species,
        'ageMonths': max(0, int(ageMonths)),
        'status': 'new',
        'createdAt': _now(),
        'updatedAt': _now()
    }
    db['pets'][pid] = pet
    save(db)
    return pet

def update_status(pid: str, status: str) -> Optional[Pet]:
    db = load()
    pet = db['pets'].get(pid)
    if not pet:
        return None
    
    updated_pet: Pet = {
        **pet,
        'status': status,
        'updatedAt': _now()
    }
    db['pets'][pid] = updated_pet
    save(db)
    return updated_pet

def list_all() -> List[Pet]:
    db = load()
    return sorted(db['pets'].values(), key=lambda p: p['updatedAt'], reverse=True)

def get(pid: str) -> Optional[Pet]:
    db = load()
    return db['pets'].get(pid)

def update(pid: str, patch: Dict) -> Optional[Pet]:
    db = load()
    cur = db['pets'].get(pid)
    if not cur:
        return None
    
    next_pet: Pet = {
        **cur,
        **patch,
        'name': patch['name'].strip() if isinstance(patch.get('name'), str) else cur['name'],
        'ageMonths': max(0, int(patch['ageMonths'])) if isinstance(patch.get('ageMonths'), (int, float)) else cur['ageMonths'],
        'updatedAt': _now()
    }
    db['pets'][pid] = next_pet
    save(db)
    return next_pet

def remove(pid: str) -> bool:
    db = load()
    if pid not in db['pets']:
        return False
    del db['pets'][pid]
    save(db)
    return True

def soft_delete(pid: str) -> Optional[Pet]:
    db = load()
    pet = db['pets'].get(pid)
    if not pet:
        return None
    
    now_ms = _now()
    updated_pet: Pet = {
        **pet,
        'status': 'deleted',
        'deletedAt': now_ms,
        'purgeAt': now_ms + (30 * 24 * 60 * 60 * 1000),  # 30 days from now
        'updatedAt': now_ms
    }
    db['pets'][pid] = updated_pet
    save(db)
    return updated_pet

def update_profile(pid: str, profile: Dict) -> Optional[Pet]:
    db = load()
    pet = db['pets'].get(pid)
    if not pet:
        return None
    
    updated_pet: Pet = {
        **pet,
        'profile': profile,
        'updatedAt': _now()
    }
    db['pets'][pid] = updated_pet
    save(db)
    return updated_pet

def find_deleted_pets_ready_to_purge() -> List[Pet]:
    db = load()
    now_ms = _now()
    return [
        pet for pet in db['pets'].values() 
        if pet['status'] == 'deleted' and pet.get('purgeAt', 0) <= now_ms
    ]
