from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.schemas import ClubResponse
from database import clubs_collection, events_collection
from bson import ObjectId
from routes.events import parse_event  # Reuse parsing utility
from auth import get_current_organizer

router = APIRouter(prefix="/clubs", tags=["Clubs"])

def parse_club(club_dict) -> ClubResponse:
    club_dict["id"] = str(club_dict["_id"])
    return ClubResponse(**club_dict)

@router.get("/", response_model=List[ClubResponse])
def get_all_clubs():
    clubs_cursor = clubs_collection.find()
    clubs = [parse_club(club) for club in clubs_cursor]
    return clubs

@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: str):
    try:
        obj_id = ObjectId(club_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    club = clubs_collection.find_one({"_id": obj_id})
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    return parse_club(club)

@router.put("/me", response_model=ClubResponse)
def update_my_club(update_data: dict, current_club: dict = Depends(get_current_organizer)):
    club_id = current_club["id"]
    
    # We only allow updating specific fields to prevent changing username/password/email via this route 
    # (or you could allow email, but lets stick to profile info)
    allowed_fields = ["club_name", "description", "location", "logo_url", "contact_number", "website_url", "social_links"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_dict:
        return current_club

    result = clubs_collection.update_one(
        {"_id": ObjectId(club_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
         raise HTTPException(status_code=404, detail="Club not found")
         
    updated_club = clubs_collection.find_one({"_id": ObjectId(club_id)})
    return parse_club(updated_club)

@router.get("/{club_id}/events")
def get_club_events(club_id: str):
    events_cursor = events_collection.find({"club_id": club_id})
    events = [parse_event(event) for event in events_cursor]
    return events
