from fastapi import APIRouter, HTTPException, Depends, status
from models.schemas import StudentCreate, ClubCreate, Token, StudentLogin, ClubLogin
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import students_collection, clubs_collection
from datetime import timedelta
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/student", status_code=status.HTTP_201_CREATED)
def register_student(student: StudentCreate):
    # Check if username or email exists
    if students_collection.find_one({"username": student.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    if students_collection.find_one({"email": student.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash password and create user
    user_dict = student.dict()
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_dict["role"] = "student"
    user_dict["bookmarked_events"] = []
    
    students_collection.insert_one(user_dict)
    return {"message": "Student registered successfully"}

@router.post("/register/club", status_code=status.HTTP_201_CREATED)
def register_club(club: ClubCreate):
    # Check if username or email exists
    if clubs_collection.find_one({"username": club.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    if clubs_collection.find_one({"email": club.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create club
    club_dict = club.dict()
    club_dict["password_hash"] = get_password_hash(club_dict.pop("password"))
    club_dict["role"] = "organizer"
    
    clubs_collection.insert_one(club_dict)
    return {"message": "Club registered successfully"}

@router.post("/login", response_model=Token)
def login(user_credentials: StudentLogin):
    # This endpoint attempts to log in either a student or a club
    
    # 1. Try finding in students
    user = students_collection.find_one({"username": user_credentials.username})
    role = "student"
    
    # 2. Try finding in clubs if not a student
    if not user:
        user = clubs_collection.find_one({"username": user_credentials.username})
        role = "organizer"
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")
        
    if not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")
        
    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": role, "id": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": role}
