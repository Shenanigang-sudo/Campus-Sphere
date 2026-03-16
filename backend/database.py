from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("Warning: MONGO_URI environment variable not set. Using local fallback for testing only.")
    MONGO_URI = "mongodb://localhost:27017"

# Connect to MongoDB cluster
client = MongoClient(MONGO_URI)

# Database Name: dbmsprojects
db = client.dbmsprojects

# Collections
students_collection = db["users"]
clubs_collection = db["clubs"]
events_collection = db["events"]
bookmarks_collection = db["bookmarks"]

# Create indexes for frequently searched fields (background=True prevents blocking)
try:
    events_collection.create_index([("title", "text"), ("keywords", "text")])
    events_collection.create_index("club_id")
    students_collection.create_index("username", unique=True)
    students_collection.create_index("email", unique=True)
    clubs_collection.create_index("username", unique=True)
    clubs_collection.create_index("email", unique=True)
except Exception as e:
    print(f"Warning: Could not create indexes. {e}")
