import os
import shutil
import json
import re # <-- Ensure re is imported early for clarity
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, Form, HTTPException
from deepgram import DeepgramClient
from anthropic import Anthropic

router = APIRouter()

load_dotenv() 

deepgram_key = os.getenv("DEEPGRAM_API_KEY")
deepgram = DeepgramClient(api_key=deepgram_key)

anthropic_key = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic(api_key=anthropic_key)


@router.post("/")
async def process_audio(
    audio: UploadFile,
    friend_name: str = Form(default="my friend"), 
    remarks: str = Form(default=""),
):
    temp_filename = f"temp_{audio.filename}"

    try:
        # --- Save audio temporarily ---
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        with open(temp_filename, "rb") as f:
            audio_bytes = f.read()

        # --- Prepare Keyterms (omitted for brevity, same as original) ---
        options = {
            "model": "nova-3",
            "smart_format": True,
            "detect_language": True,
        }
        if remarks:
            terms = [w for w in remarks.split() if len(w) > 4][:10]
            if terms:
                options["keyterm"] = terms

        # --- Deepgram transcription (omitted for brevity, same as original) ---
        dg_response = deepgram.listen.v1.media.transcribe_file(
            request=audio_bytes,
            **options
        )

        if (not dg_response.results or 
            not dg_response.results.channels or 
            not dg_response.results.channels[0].alternatives):
             raise HTTPException(status_code=400, detail="No transcript generated from audio")

        transcript = dg_response.results.channels[0].alternatives[0].transcript
        if not transcript:
            raise HTTPException(status_code=400, detail="Transcript was empty")

        # --- Claude analysis ---
        name_for_prompt = friend_name if friend_name.strip() else "my friend"

        system_prompt = (
            "You are a helpful assistant analyzing a personal conversation transcript.\n"
            "The goal is to summarize the speaker's activities and discussions in a **casual, diary-like style**.\n"
            "The speaker is creating this summary for their own memory review. The friend's name is **{name_for_prompt}**.\n"
            "--- GUIDELINES FOR CONTENT GENERATION ---\n"
            "1. **Tone and Voice:** Use the first person (I/my, we/our) and maintain an informal, chatty tone.\n"
            "2. **Language Handling:** Detect the language of the transcript automatically. Generate the summary in the same language as the transcript.\n"
            "3. **Friend Reference (Crucial):** Never use 'you' in the generated summary content. Always refer to the friend by their actual name **{name_for_prompt}** or a descriptor like 'my friend' (or equivalent in the transcript's language).\n"
            "4. **Perspective:** Write strictly from the speaker's point of view, detailing the events as the speaker experienced them. Adapt phrasing naturally to the transcript's language.\n"
            "   - Example: 'I showed her my pet' → 'I showed **{name_for_prompt}** my pet' (or translated appropriately).\n"
            "   - Example: '{name_for_prompt} told me X' → '**{name_for_prompt}** told me X' (or translated appropriately).\n"
            "5. **Anonymity:** Replace sensitive names (other than {name_for_prompt}) with generic placeholders appropriate to the language (e.g., 'another friend', 'a relative').\n"
            "6. **Output:** Extract the main topics or events discussed and return **JSON only**, using the following format.\n"
            "--- JSON FORMAT ---\n"
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

        # 1. Remove code fences and optional 'json' tag
        if "```" in raw_output:
            parts = raw_output.split("```")
            if len(parts) > 1:
                raw_output = parts[1].strip()
        if raw_output.lower().startswith("json"):
            raw_output = raw_output[4:].strip()

        try:
            analyzed = json.loads(raw_output)
        except Exception:
             import re 
             match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
             if match:
                 # Attempt to parse the content captured by the regex group
                 json_string = match.group(1).strip()
                 try:
                     analyzed = json.loads(json_string)
                 except Exception:
                     # If regex capture still fails, raise the original error
                     raise HTTPException(
                        status_code=500,
                        detail=f"Claude did NOT return valid JSON after regex cleanup. Clean string was:\n{json_string}"
                    )
             else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Claude did NOT return valid JSON. Raw output was:\n{raw_output}"
                )
        
        return analyzed

    except Exception as e:
        print("Error:", e)
        # Ensure the raised HTTPException detail is not truncated/malformed
        if isinstance(e, HTTPException):
             raise e
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)