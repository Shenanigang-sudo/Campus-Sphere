from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import auth, events, students, clubs
import os, shutil, uuid

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Campus Events Portal API",
    description="API for the Campus Events Portal to manage events, clubs, and student registrations.",
    version="1.0.0"
)

# Setup CORS for Frontend
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:5174", # Vite fallback port
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files at /uploads/filename
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(clubs.router)
app.include_router(students.router)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

@app.post("/upload", tags=["Upload"])
async def upload_image(file: UploadFile = File(...)):
    """Upload a local image (jpg/jpeg/png) and get back its URL."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only jpg, jpeg, and png files are allowed.")
    
    # Generate a unique filename to avoid collisions
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL that can be used directly in the frontend
    return {"url": f"http://localhost:8000/uploads/{unique_filename}"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Campus Events Portal API"}
