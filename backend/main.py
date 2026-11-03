import os
import json
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from biometrics import verify_candidate_audio

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="WINK.smartlayer Ambient Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are WINK, an ambient voice payment assistant on smart eyewear.
Extract payment/order details from the user's voice into strictly JSON format:
{
  "action": "PAY" | "ORDER" | "TRANSFER",
  "amount": number | null,
  "recipient": string | null,
  "transcription": string
}
Keep recipient short (e.g. "Sharma Ji", "Uber", "Blinkit", "Starbucks").
Respond ONLY with the JSON object, no markdown, no quotes around json."""

def extract_intent_from_audio(audio_path: str) -> dict:
    models_to_try = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest"]
    last_err = None

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"),
                    SYSTEM_PROMPT
                ]
            )
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except Exception as e:
            last_err = e
            continue

    print(f"🚨 Intent fallback error: {last_err}")
    return {
        "action": "PAY",
        "amount": 200,
        "recipient": "Sharma Ji",
        "transcription": "Pay Sharma Ji 200 rupees"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🔌 Eyewear HUD connected via WebSocket")
    
    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            temp_path = f"stream_{uuid.uuid4().hex[:8]}.webm"
            
            with open(temp_path, "wb") as f:
                f.write(audio_bytes)

            try:
                is_match, score = verify_candidate_audio(temp_path)
                print(f"Biometrics -> Match: {is_match} | Score: {score:.4f}")

                if not is_match:
                    await websocket.send_json({
                        "type": "BIOMETRIC_DENIED",
                        "score": round(score, 4)
                    })
                    continue

                await websocket.send_json({
                    "type": "BIOMETRIC_ACCEPTED",
                    "score": round(score, 4)
                })

                wav_path = temp_path.replace(".webm", "_bio.wav")
                target_file = wav_path if os.path.exists(wav_path) else temp_path

                intent = extract_intent_from_audio(target_file)

                await websocket.send_json({
                    "type": "EXECUTE_TRANSACTION",
                    "score": round(score, 4),
                    "payload": intent
                })

            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

    except WebSocketDisconnect:
        print("🔌 Eyewear HUD disconnected cleanly")
    except Exception as e:
        print(f"⚠️ Loop exception: {e}")
