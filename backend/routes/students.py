from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from models.schemas import Bookmark, StudentResponse, EventResponse
from database import students_collection, bookmarks_collection, events_collection
from auth import get_current_student
from bson import ObjectId
from datetime import datetime
from routes.events import parse_event

router = APIRouter(prefix="/students", tags=["Students"])

def parse_student(student_dict) -> StudentResponse:
    student_dict["id"] = str(student_dict["_id"])
    return StudentResponse(**student_dict)

@router.get("/me", response_model=StudentResponse)
def get_my_profile(current_student: dict = Depends(get_current_student)):
    return parse_student(current_student)

@router.put("/me", response_model=StudentResponse)
def update_my_profile(update_data: dict, current_student: dict = Depends(get_current_student)):
    student_id = current_student["id"]
    
    # Restrict allowed fields
    allowed_fields = ["name", "course", "academic_year_start", "academic_year_end"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_dict:
        return current_student
        
    result = students_collection.update_one(
        {"_id": ObjectId(student_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
        
    updated_student = students_collection.find_one({"_id": ObjectId(student_id)})
    return parse_student(updated_student)

@router.post("/bookmarks/{event_id}", status_code=status.HTTP_201_CREATED)
def add_bookmark(event_id: str, current_student: dict = Depends(get_current_student)):
    try:
        obj_id = ObjectId(event_id)
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid ID format")
         
    # Check if event exists
    event = events_collection.find_one({"_id": obj_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    student_id = current_student["id"]
    
    # Check if already bookmarked
    existing_bookmark = bookmarks_collection.find_one({
        "student_id": student_id,
        "event_id": event_id
    })
    
    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Event already bookmarked")
        
    bookmark = {
        "student_id": student_id,
        "event_id": event_id,
        "bookmarked_at": datetime.utcnow()
    }
    
    bookmarks_collection.insert_one(bookmark)
    
    # Also update student array for easier profile fetching
    students_collection.update_one(
        {"_id": ObjectId(student_id)},
        {"$addToSet": {"bookmarked_events": event_id}}
    )
    
    return {"message": "Bookmark added"}

@router.delete("/bookmarks/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_bookmark(event_id: str, current_student: dict = Depends(get_current_student)):
    student_id = current_student["id"]
    
    result = bookmarks_collection.delete_one({
        "student_id": student_id,
        "event_id": event_id
    })
    
    if result.deleted_count == 0:
         raise HTTPException(status_code=404, detail="Bookmark not found")
         
    students_collection.update_one(
        {"_id": ObjectId(student_id)},
        {"$pull": {"bookmarked_events": event_id}}
    )
    return

@router.get("/bookmarks", response_model=List[EventResponse])
def get_my_bookmarks(current_student: dict = Depends(get_current_student)):
    # Find all bookmarks for this user
    bookmarked_event_ids = [
        ObjectId(b["event_id"]) 
        for b in bookmarks_collection.find({"student_id": current_student["id"]})
    ]
    
    if not bookmarked_event_ids:
        return []
        
    events_cursor = events_collection.find({"_id": {"$in": bookmarked_event_ids}})
    events = [parse_event(event) for event in events_cursor]
    return events
