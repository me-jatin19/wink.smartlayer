import os
import subprocess
import torch
import torchaudio
from speechbrain.inference.speaker import SpeakerRecognition

verification_model = SpeakerRecognition.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="tmpdir_speechbrain"
)

OWNER_PROFILE_PATH = "owner_profile.pt"
SIMILARITY_THRESHOLD = 0.25

def convert_to_wav(input_path: str, output_path: str) -> bool:
    cmd = [
        "ffmpeg", "-y",
        "-err_detect", "ignore_err",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-f", "wav",
        output_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0

def extract_embedding(wav_path: str):
    signal, fs = torchaudio.load(wav_path)
    if fs != 16000:
        resampler = torchaudio.transforms.Resample(orig_freq=fs, new_freq=16000)
        signal = resampler(signal)
    with torch.no_grad():
        emb = verification_model.encode_batch(signal).squeeze()
        emb = emb / torch.norm(emb)
    return emb

def verify_candidate_audio(candidate_path: str) -> tuple[bool, float]:
    temp_wav = candidate_path.replace(".webm", "_bio.wav")
    if not convert_to_wav(candidate_path, temp_wav):
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
        return False, 0.0

    try:
        if not os.path.exists(OWNER_PROFILE_PATH):
            print("⚠️ Warning: owner_profile.pt not found.")
            return False, 0.0

        candidate_emb = extract_embedding(temp_wav)
        owner_emb = torch.load(OWNER_PROFILE_PATH)

        cosine_sim = torch.dot(owner_emb, candidate_emb).item()
        is_match = cosine_sim >= SIMILARITY_THRESHOLD

        return is_match, float(cosine_sim)

    except Exception as e:
        print(f"🚨 Biometrics Error: {e}")
        return False, 0.0
    finally:
        if os.path.exists(temp_wav):
            os.remove(temp_wav)
