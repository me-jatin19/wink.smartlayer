// Single source of truth for the five layers of the WINK stack.
// Every technical detail here mirrors what backend/main.py and backend/biometrics.py actually do.

export type LayerId = "capture" | "transport" | "biometric" | "intent" | "settlement";

export interface Layer {
  id: LayerId;
  index: string;
  name: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  color: string; // css color used for the plate glow
}

export const LAYERS: Layer[] = [
  {
    id: "capture",
    index: "L1",
    name: "Capture",
    tagline: "Push-to-talk on the temple.",
    description:
      "Squeeze the right temple and speak. Frame microphones record a short mono clip, with no echo cancellation or noise suppression, so the voice reaches the next layer unfiltered.",
    specs: [
      { label: "Trigger", value: "Right-temple PTT" },
      { label: "Channel", value: "Mono · 16 kHz" },
      { label: "Codec", value: "Opus / WebM" },
    ],
    color: "#ff7a3d",
  },
  {
    id: "transport",
    index: "L2",
    name: "Transport",
    tagline: "One socket, straight to the engine.",
    description:
      "The clip goes out as raw bytes over a persistent WebSocket to the WINK ambient engine, built on FastAPI. Each status change streams back over the same connection.",
    specs: [
      { label: "Protocol", value: "WebSocket /ws" },
      { label: "Server", value: "FastAPI" },
      { label: "Normalise", value: "ffmpeg → WAV" },
    ],
    color: "#a78bfa",
  },
  {
    id: "biometric",
    index: "L3",
    name: "Voice Biometric Gate",
    tagline: "Your voice is the password.",
    description:
      "SpeechBrain's ECAPA-TDNN model, trained on VoxCeleb, turns the clip into a speaker embedding and compares it with the enrolled owner profile by cosine similarity. If it doesn't match, the request stops here.",
    specs: [
      { label: "Model", value: "ECAPA-TDNN" },
      { label: "Metric", value: "Cosine similarity" },
      { label: "Gate", value: "≥ 0.25" },
    ],
    color: "#34d399",
  },
  {
    id: "intent",
    index: "L4",
    name: "Intent Engine",
    tagline: "Understands what you meant.",
    description:
      "Only after the voice is verified, Gemini Flash listens to the same audio and extracts a strict JSON intent: what to do, how much, and for whom.",
    specs: [
      { label: "Model", value: "Gemini Flash" },
      { label: "Actions", value: "PAY · ORDER · TRANSFER" },
      { label: "Output", value: "Strict JSON" },
    ],
    color: "#4f8cff",
  },
  {
    id: "settlement",
    index: "L5",
    name: "Settlement & HUD",
    tagline: "Done before you look down.",
    description:
      "The intent becomes a transaction. The wallet balance updates, the ledger records it, and the confirmation appears in the eyewear HUD.",
    specs: [
      { label: "Event", value: "EXECUTE_TRANSACTION" },
      { label: "Surface", value: "Micro-OLED HUD" },
      { label: "Ledger", value: "Live wallet sync" },
    ],
    color: "#3de0ff",
  },
];
