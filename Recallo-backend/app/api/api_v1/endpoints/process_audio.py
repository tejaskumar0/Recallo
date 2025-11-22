import os
import shutil
import json
from fastapi import APIRouter, UploadFile, Form, HTTPException
from deepgram import DeepgramClient
from anthropic import Anthropic

router = APIRouter()

deepgram_key = os.getenv("DEEPGRAM_API_KEY")
deepgram = DeepgramClient(api_key=deepgram_key)

anthropic_key = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic(api_key=anthropic_key)


@router.post("/process_audio")
async def process_audio(
    audio: UploadFile,
    remarks: str = Form(default="")
):
    temp_filename = f"temp_{audio.filename}"

    try:
        # --- Save audio temporarily ---
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        with open(temp_filename, "rb") as f:
            audio_bytes = f.read()

        # --- Prepare Keyterms ---
        # Nova-3 uses 'keyterm', not 'keywords'
        options = {
            "model": "nova-3",
            "smart_format": True,
        }
        
        # Only add keyterms if remarks exist
        if remarks:
            terms = [w for w in remarks.split() if len(w) > 4][:10]
            if terms:
                options["keyterm"] = terms

        # --- Deepgram transcription ---
        dg_response = deepgram.listen.v1.media.transcribe_file(
            request=audio_bytes,
            **options
        )

        # Check if transcript exists
        if (not dg_response.results or 
            not dg_response.results.channels or 
            not dg_response.results.channels[0].alternatives):
             raise HTTPException(status_code=400, detail="No transcript generated from audio")

        transcript = dg_response.results.channels[0].alternatives[0].transcript

        if not transcript:
            raise HTTPException(status_code=400, detail="Transcript was empty")

        # --- Claude analysis ---
        system_prompt = (
            "You are a helpful assistant analyzing a transcript.\n"
            "If the transcript contains personal or sensitive information, "
            "first rewrite it in an anonymized and safe form.\n"
            "After anonymizing, extract the main topics.\n"
            "Return JSON only in this format:\n"
            "{\n"
            "  \"topics\": [\n"
            "    {\"topic\": \"string\", \"content\": \"string\"}\n"
            "  ]\n"
            "}\n"
        )

        ai_response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            temperature=0,
            system=system_prompt, 
            messages=[
                {
                    "role": "user",
                    "content": f"Transcript:\n{transcript}"
                }
            ]
        )

        if ai_response.stop_reason == "refusal" or not ai_response.content:
            return {
                "topics": [],
                "warning": "Claude refused due to safety rules."
            }

        raw_output = ai_response.content[0].text.strip()

        # Clean up formatting
        if "```" in raw_output:
            parts = raw_output.split("```")
            if len(parts) > 1:
                raw_output = parts[1].strip()

        if raw_output.lower().startswith("json"):
            raw_output = raw_output[4:].strip()

        # Validate JSON
        try:
            analyzed = json.loads(raw_output)
        except Exception:
             import re
             match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
             if match:
                 analyzed = json.loads(match.group(1))
             else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Claude did NOT return valid JSON. Raw output was:\n{raw_output}"
                )
        
        return analyzed

    except Exception as e:
        print("Error:", e)
        # Print details to console so we can see what happened in the server logs
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)