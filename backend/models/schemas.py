from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from datetime import datetime

# --- Common ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- Student ---
class StudentCreate(BaseModel):
    name: str
    course: str
    academic_year_start: int
    academic_year_end: int
    username: str
    email: EmailStr
    password: str

class StudentLogin(BaseModel):
    username: str
    password: str

class StudentResponse(BaseModel):
    id: str
    role: str = "student"
    name: str
    course: str
    academic_year_start: int
    academic_year_end: int
    username: str
    email: EmailStr
    bookmarked_events: List[str] = []

# --- Club (Organizer) ---
class ClubCreate(BaseModel):
    club_name: str
    description: str
    location: str
    logo_url: str = "" # Handle generic upload later
    username: str
    email: EmailStr
    password: str
    contact_number: str
    website_url: Optional[str] = None
    social_links: Optional[str] = None

class ClubLogin(BaseModel):
    username: str
    password: str

class ClubResponse(BaseModel):
    id: str
    role: str = "organizer"
    club_name: str
    description: str
    location: str
    logo_url: str
    username: str
    email: EmailStr
    contact_number: str
    website_url: Optional[str] = None
    social_links: Optional[str] = None

# --- Event ---
class EventCreate(BaseModel):
    title: str
    poster_url: str = ""
    date: str
    time: str
    venue: str
    description: str
    eligibility: str
    ticket_rate: str
    duty_leave: bool
    certificates: bool
    activity_points: int
    keywords: List[str] = []
    rsvp_link: str
    organizer_contact: str

class EventResponse(BaseModel):
    id: str
    title: str
    club_id: str
    club_name: str
    poster_url: str
    date: str
    time: str
    venue: str
    description: str
    eligibility: str
    ticket_rate: str
    duty_leave: bool
    certificates: bool
    activity_points: int
    keywords: List[str]
    rsvp_link: str
    organizer_contact: str
    created_at: datetime

# --- Bookmark ---
class Bookmark(BaseModel):
    student_id: str
    event_id: str
    bookmarked_at: datetime
