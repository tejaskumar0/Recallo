import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv

# Load env vars (API keys)
load_dotenv()

# Import ONLY your transcription router
from app.api.api_v1.endpoints import process_audio

# Create a mini app
app = FastAPI()

# Register the router
app.include_router(process_audio.router, prefix="/test")

if __name__ == "__main__":
    print("🚀 Starting Isolated Debug Server...")
    print("endpoint: http://127.0.0.1:8000/test/process_audio")
    uvicorn.run(app, host="127.0.0.1", port=8000)