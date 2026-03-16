from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from models.schemas import EventCreate, EventResponse
from database import events_collection
from auth import get_current_organizer
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/events", tags=["Events"])

def parse_event(event_dict) -> EventResponse:
    event_dict["id"] = str(event_dict["_id"])
    return EventResponse(**event_dict)


@router.get("/", response_model=List[EventResponse])
def get_all_events():
    # Return all events, sorted by nearest date first
    events_cursor = events_collection.find().sort("date", 1)
    events = [parse_event(event) for event in events_cursor]
    return events


@router.get("/search", response_model=List[EventResponse])
def search_events(
    q: Optional[str] = None, 
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    query = {}
    if q:
        regex_query = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"title": regex_query},
            {"club_name": regex_query},
            {"description": regex_query},
            {"keywords": regex_query}
        ]
    if category:
        query["keywords"] = {"$in": [category.lower(), category.capitalize()]}
    
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = date_from
        if date_to:
            query["date"]["$lte"] = date_to
        
    events_cursor = events_collection.find(query)
    events = [parse_event(event) for event in events_cursor]
    return events


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    try:
        event = events_collection.find_one({"_id": ObjectId(event_id)})
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid ID format")
         
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return parse_event(event)


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: EventCreate, current_organizer: dict = Depends(get_current_organizer)):
    event_dict = event.dict()
    # Add organizer info automatically
    event_dict["club_id"] = current_organizer["id"]
    event_dict["club_name"] = current_organizer["club_name"]
    event_dict["created_at"] = datetime.utcnow()
    
    result = events_collection.insert_one(event_dict)
    
    # Return the created event
    created_event = events_collection.find_one({"_id": result.inserted_id})
    return parse_event(created_event)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event_update: EventCreate, current_organizer: dict = Depends(get_current_organizer)):
    try:
        obj_id = ObjectId(event_id)
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid ID format")
         
    existing_event = events_collection.find_one({"_id": obj_id})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Verify the logged-in club owns this event
    if existing_event["club_id"] != current_organizer["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    update_dict = event_update.dict()
    # Ensure they can't change the origin club
    update_dict["club_id"] = existing_event["club_id"]
    update_dict["club_name"] = existing_event["club_name"]
    update_dict["created_at"] = existing_event["created_at"] # Preserve creation time

    events_collection.update_one({"_id": obj_id}, {"$set": update_dict})
    
    updated_event = events_collection.find_one({"_id": obj_id})
    return parse_event(updated_event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, current_organizer: dict = Depends(get_current_organizer)):
    try:
        obj_id = ObjectId(event_id)
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid ID format")
         
    existing_event = events_collection.find_one({"_id": obj_id})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Verify the logged-in club owns this event
    if existing_event["club_id"] != current_organizer["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    events_collection.delete_one({"_id": obj_id})
    return
