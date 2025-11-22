import os
import shutil
from fastapi import APIRouter, UploadFile, Form, HTTPException
from deepgram import DeepgramClient

router = APIRouter()

deepgram = DeepgramClient(api_key="07db2deb65dc0b3d9da395d726801327fe4056c2")

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile,
    remarks: str = Form(default="")
):
    temp_filename = f"temp_{audio.filename}"

    try:
        # Save audio temporarily
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Read file into memory
        with open(temp_filename, "rb") as f:
            audio_bytes = f.read()

        # Call Deepgram SDK v5
        response = deepgram.listen.v1.media.transcribe_file(
            request=audio_bytes,
            model="nova-3",
            smart_format=True,
            keywords=[w for w in remarks.split() if len(w) > 4][:10]
        )

        # Extract transcript
        transcript = (
            response.results.channels[0]
            .alternatives[0]
            .transcript
        )

        return {"text": transcript}

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)