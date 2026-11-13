"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LAYERS } from "./layers";

type StepStatus = "idle" | "recording" | "biometrics" | "gemini" | "complete" | "denied";

interface Transaction {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "debit" | "credit";
  color: string;
}

interface Intent {
  action?: string;
  amount?: number | null;
  recipient?: string | null;
  transcription?: string;
}

const WS_URL = "ws://localhost:8000/ws";
const THRESHOLD = 0.25;

const SIM_SCRIPTS: Intent[] = [
  { action: "ORDER", amount: 240, recipient: "Blinkit", transcription: "Order milk and eggs from Blinkit" },
  { action: "PAY", amount: 200, recipient: "Sharma Ji", transcription: "Pay Sharma Ji two hundred rupees" },
  { action: "PAY", amount: 380, recipient: "Uber", transcription: "Book an Uber to the airport" },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// Which layer is lit for each pipeline step.
const STEP_LAYER: Record<StepStatus, number> = {
  idle: -1,
  recording: 0,
  biometrics: 2,
  gemini: 3,
  complete: 5,
  denied: 2,
};

export default function LiveDemo() {
  const [balance, setBalance] = useState(5750);
  const [displayBalance, setDisplayBalance] = useState(5750);

  const [connected, setConnected] = useState(false);
  const [step, setStep] = useState<StepStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Connecting to ambient engine…");
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState("");
  const [lastIntent, setLastIntent] = useState<Intent | null>(null);
  const [simulated, setSimulated] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, title: "Blinkit", category: "Organic milk & apples", date: "Today, 2:14 PM", amount: 139, type: "debit", color: "#f5c542" },
    { id: 2, title: "Uber Premier", category: "Drop to Terminal 3", date: "Yesterday", amount: 380, type: "debit", color: "#e5e7eb" },
    { id: 3, title: "WINK Cashback", category: "Launch reward", date: "2 Oct 2026", amount: 50, type: "credit", color: "#34d399" },
    { id: 4, title: "Sharma Ji Grocery", category: "Voice UPI", date: "28 Sep 2026", amount: 500, type: "debit", color: "#4f8cff" },
  ]);

  const ws = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const tickerRef = useRef<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const simIndex = useRef(0);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Animated balance ticker
  useEffect(() => {
    if (displayBalance === balance) return;
    const start = displayBalance;
    const end = balance;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayBalance(Math.round(start - (start - end) * eased));
      if (p < 1) tickerRef.current = requestAnimationFrame(tick);
    };
    tickerRef.current = requestAnimationFrame(tick);
    return () => {
      if (tickerRef.current) cancelAnimationFrame(tickerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  const settle = useCallback((payload: Intent, score: number | null) => {
    setStep("complete");
    if (score !== null) setSimilarityScore(score);
    setLastIntent(payload);

    const cost = payload.amount || (payload.action === "PAY" ? 200 : 150);
    const raw = payload.transcription || "Voice checkout";
    setLastSpokenText(raw);

    let title = payload.recipient || "Autonomous Pay";
    let category = "Instant settlement";
    let color = "#4f8cff";
    if (/blinkit|milk|bread|eggs|grocery|apples/i.test(raw)) {
      title = "Blinkit";
      category = "Grocery basket";
      color = "#f5c542";
    } else if (/uber|cab|ride|ola|drive/i.test(raw)) {
      title = "Uber Premier";
      category = "Ride booked";
      color = "#e5e7eb";
    }

    setBalance((prev) => Math.max(0, prev - cost));
    setTransactions((prev) => [
      { id: Date.now(), title, category, date: "Just now", amount: cost, type: "debit", color },
      ...prev,
    ]);
    setStatusMessage(`Paid ${inr(cost)} · shown in HUD`);
    later(() => setStep("idle"), 4000);
  }, []);

  // WebSocket to the FastAPI engine
  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setStatusMessage("Engine linked · hold to speak");
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setSimulated(false);
        if (data.type === "BIOMETRIC_DENIED") {
          setStep("denied");
          setSimilarityScore(data.score);
          setStatusMessage(`Voice mismatch · ${(data.score * 100).toFixed(0)}% similarity`);
          later(() => setStep("idle"), 3500);
        } else if (data.type === "BIOMETRIC_ACCEPTED") {
          setStep("gemini");
          setSimilarityScore(data.score);
          setStatusMessage("Voice verified · extracting intent…");
        } else if (data.type === "EXECUTE_TRANSACTION") {
          settle(data.payload, data.score ?? null);
        }
      } catch {
        setStatusMessage("Signal processing error");
      }
    };
    socket.onclose = () => {
      setConnected(false);
      setStatusMessage("Engine offline · try the simulation");
    };
    return () => socket.close();
  }, [settle]);

  const startRecording = async () => {
    if (!connected || step !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1, sampleRate: 16000 },
      });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 2500) {
          setStep("idle");
          setStatusMessage("Too short · hold a little longer");
          return;
        }
        setStep("biometrics");
        setStatusMessage("Extracting ECAPA voiceprint…");
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(await blob.arrayBuffer());
        } else {
          setStep("idle");
          setStatusMessage("Engine offline · try the simulation");
        }
      };

      recorder.start(250);
      setStep("recording");
      setSimulated(false);
      setLastSpokenText("");
      setLastIntent(null);
      setSimilarityScore(null);
      setStatusMessage("Listening…");
    } catch {
      setStatusMessage("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") {
      r.requestData();
      r.stop();
    }
  };

  // Clearly-labelled simulation so the flow can be seen without the Python engine running.
  const simulate = (imposter = false) => {
    if (step !== "idle" && step !== "complete" && step !== "denied") return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const script = SIM_SCRIPTS[simIndex.current++ % SIM_SCRIPTS.length];

    setSimulated(true);
    setLastIntent(null);
    setLastSpokenText("");
    setSimilarityScore(null);
    setStep("recording");
    setStatusMessage("Listening… (simulated)");

    later(() => {
      setStep("biometrics");
      setStatusMessage("Extracting ECAPA voiceprint…");
    }, 1600);

    if (imposter) {
      later(() => {
        const s = 0.08 + Math.random() * 0.1;
        setStep("denied");
        setSimilarityScore(s);
        setStatusMessage(`Voice mismatch · ${(s * 100).toFixed(0)}% similarity`);
      }, 2900);
      later(() => setStep("idle"), 6200);
      return;
    }

    later(() => {
      const s = 0.62 + Math.random() * 0.2;
      setStep("gemini");
      setSimilarityScore(s);
      setStatusMessage("Voice verified · extracting intent…");
    }, 2900);
    later(() => settle(script, null), 4300);
  };

  const isDeducting = displayBalance !== balance;
  const activeLayer = STEP_LAYER[step];
  const busy = step === "biometrics" || step === "gemini";
  const scorePct = similarityScore !== null ? Math.max(0, Math.min(1, similarityScore)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* ── Eyewear / HUD console ── */}
      <div className="lg:col-span-8 ring-gradient rounded-[32px] bg-bg-elev overflow-hidden flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Live console</p>
            <h3 className="text-lg font-semibold tracking-tight">What the eyewear sees</h3>
          </div>
          <div className="flex items-center gap-2">
            {simulated && (
              <span className="font-mono text-[10px] uppercase tracking-wider rounded-full border border-signal/40 bg-signal/10 text-signal px-2.5 py-1">
                Simulation
              </span>
            )}
            <span className="flex items-center gap-2 rounded-full border border-line bg-black/30 px-3 py-1 font-mono text-[11px] text-fg-muted">
              <span className={"h-1.5 w-1.5 rounded-full " + (connected ? "bg-ok shadow-[0_0_8px_var(--ok)]" : "bg-amber-400 animate-pulse")} />
              {connected ? "Engine linked" : "Engine offline"}
            </span>
          </div>
        </div>

        {/* Lens view */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div
            className={"absolute h-64 w-64 rounded-full blur-3xl transition-all duration-700 " + (
              step === "denied" ? "bg-bad/25" : step === "complete" ? "bg-ok/20" : step === "recording" ? "bg-signal/25" : "bg-accent/15"
            )}
          />
          <Image
            src="/glasses.png"
            alt="WINK-enabled smart eyewear"
            width={737}
            height={339}
            className={"relative w-[min(480px,90%)] h-auto transition-transform duration-500 " + (step === "recording" ? "scale-[1.04]" : "")}
            style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}
          />

          {/* HUD bubble */}
          <div className="absolute left-4 sm:left-8 top-4 sm:top-6 max-w-[240px] rounded-2xl border border-accent-2/30 bg-black/55 backdrop-blur-md px-4 py-3 shadow-[0_0_30px_rgba(61,224,255,0.12)]">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent-2/80">HUD</p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-fg">{statusMessage}</p>
            {step === "recording" && (
              <div className="mt-2 flex h-5 items-end gap-[3px]" aria-hidden>
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[3px] h-full origin-bottom rounded-full bg-signal animate-wave"
                    style={{ animationDelay: `${(i * 73) % 600}ms` }}
                  />
                ))}
              </div>
            )}
            {lastIntent && step === "complete" && (
              <pre className="mt-2 overflow-hidden rounded-lg bg-white/5 p-2 font-mono text-[10px] leading-relaxed text-accent-2">
{`{ "action": "${lastIntent.action ?? "PAY"}",
  "amount": ${lastIntent.amount ?? "null"},
  "recipient": "${lastIntent.recipient ?? ""}" }`}
              </pre>
            )}
          </div>

          {/* Similarity gauge */}
          <div className="absolute right-4 sm:right-8 bottom-4 sm:bottom-6 w-[170px] rounded-2xl border border-line bg-black/55 backdrop-blur-md px-4 py-3">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dim">
              <span>Voice match</span>
              <span className={similarityScore === null ? "" : similarityScore >= THRESHOLD ? "text-ok" : "text-bad"}>
                {similarityScore === null ? "—" : `${(similarityScore * 100).toFixed(0)}%`}
              </span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-white/10">
              <div
                className={"absolute inset-y-0 left-0 rounded-full transition-all duration-700 " + (similarityScore !== null && similarityScore < THRESHOLD ? "bg-bad" : "bg-ok")}
                style={{ width: `${scorePct * 100}%` }}
              />
              <div className="absolute -top-1 -bottom-1 w-px bg-white/60" style={{ left: `${THRESHOLD * 100}%` }} title="Gate threshold 0.25" />
            </div>
            <p className="mt-1.5 font-mono text-[9px] text-fg-dim">gate ≥ {THRESHOLD.toFixed(2)}</p>
          </div>
        </div>

        {/* Pipeline tracker */}
        <div className="grid grid-cols-5 border-t border-line">
          {LAYERS.map((l, i) => {
            const failed = step === "denied" && i === 2;
            const done = !failed && i < activeLayer;
            const active = !failed && i === activeLayer;
            const skipped = step === "denied" && i > 2;
            return (
              <div key={l.id} className={"relative px-2 sm:px-4 py-3.5 border-line " + (i > 0 ? "border-l" : "")}>
                <div
                  className="absolute inset-x-0 top-0 h-[2px] transition-all duration-500"
                  style={{
                    background: failed ? "var(--bad)" : done || active ? l.color : "transparent",
                    opacity: active ? 1 : 0.6,
                    boxShadow: active ? `0 0 12px ${l.color}` : undefined,
                  }}
                />
                <p className="font-mono text-[10px]" style={{ color: failed ? "var(--bad)" : done || active ? l.color : "var(--fg-dim)" }}>
                  {l.index}
                  <span className="ml-1">{failed ? "✕" : done ? "✓" : active ? "●" : ""}</span>
                </p>
                <p className={"mt-0.5 text-[11px] sm:text-xs font-medium leading-tight " + (skipped ? "text-fg-dim line-through" : done || active || failed ? "text-fg" : "text-fg-dim")}>
                  {l.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Wallet phone ── */}
      <div className="lg:col-span-4 flex justify-center">
        <div className="w-full max-w-[360px] rounded-[44px] border border-white/10 bg-gradient-to-b from-[#12141c] to-[#0a0b10] p-2.5 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <div className="h-full rounded-[36px] bg-[#0b0d13] border border-white/5 p-5 flex flex-col">
            <div className="flex items-center justify-between font-mono text-[11px] text-fg-muted px-1">
              <span>9:41</span>
              <span className="h-5 w-20 rounded-full bg-black" />
              <span>5G</span>
            </div>

            <div className="mt-4 flex items-center justify-between px-1">
              <h3 className="font-semibold">WINK Wallet</h3>
              <span className="h-8 w-8 rounded-full bg-white/5 border border-line grid place-items-center font-mono text-[11px] text-fg-muted">JS</span>
            </div>

            {/* Card */}
            <div className="relative mt-4 overflow-hidden rounded-3xl p-5 text-white bg-[radial-gradient(120%_120%_at_0%_0%,#3d7bff_0%,#1f3fb8_45%,#0f1a4d_100%)] shadow-[0_20px_50px_rgba(37,99,235,0.35)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/15" />
              <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full border border-white/10" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Balance</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums tracking-tight">{inr(displayBalance)}</span>
                {isDeducting && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[9px] animate-pulse">syncing</span>
                )}
              </div>
              <div className="mt-6 flex items-end justify-between font-mono text-[11px] text-white/75">
                <span className="tracking-[0.2em]">•••• 1289</span>
                <span className="font-serif italic text-lg text-white">wink</span>
              </div>
            </div>

            {/* Transactions */}
            <div className="mt-5 flex items-center justify-between px-1">
              <h4 className="text-xs font-semibold text-fg-muted">Recent activity</h4>
              <span className="font-mono text-[10px] text-fg-dim">{transactions.length} items</span>
            </div>
            <ul className="mt-2 space-y-1">
              {transactions.slice(0, 4).map((tx, i) => (
                <li
                  key={tx.id}
                  className={"flex items-center justify-between rounded-2xl px-2 py-2 transition-colors " + (i === 0 && tx.date === "Just now" ? "bg-accent/10 animate-[fadeUp_.5s_ease]" : "")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-9 w-9 shrink-0 rounded-xl grid place-items-center text-xs font-semibold"
                      style={{ background: tx.color + "1f", color: tx.color }}
                    >
                      {tx.title.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{tx.title}</p>
                      <p className="text-[10.5px] text-fg-dim truncate">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className={"text-[13px] font-semibold tabular-nums " + (tx.type === "credit" ? "text-ok" : "text-fg")}>
                      {tx.type === "credit" ? "+" : "−"}
                      {inr(tx.amount)}
                    </p>
                    <p className="font-mono text-[9.5px] text-fg-dim">{tx.date}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Controls */}
            <div className="mt-auto pt-4">
              {connected ? (
                <button
                  type="button"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={busy}
                  className={"w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all cursor-pointer select-none disabled:cursor-wait " + (
                    step === "recording"
                      ? "bg-signal text-black scale-[0.98] shadow-[0_0_40px_rgba(255,122,61,0.5)]"
                      : busy
                        ? "bg-accent/60 text-white animate-pulse"
                        : "bg-accent text-white hover:brightness-110 shadow-[0_10px_30px_rgba(79,140,255,0.35)]"
                  )}
                >
                  <MicIcon />
                  {step === "recording" ? "Release to send" : busy ? "Processing…" : "Hold to speak"}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => simulate(false)}
                    disabled={busy || step === "recording"}
                    className="rounded-2xl bg-accent py-3 text-[13px] font-semibold text-white hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                  >
                    Simulate owner
                  </button>
                  <button
                    type="button"
                    onClick={() => simulate(true)}
                    disabled={busy || step === "recording"}
                    className="rounded-2xl border border-bad/40 bg-bad/10 py-3 text-[13px] font-semibold text-bad hover:bg-bad/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    Simulate imposter
                  </button>
                </div>
              )}
              <p className="mt-2 h-4 text-center text-[11px] italic text-fg-dim truncate">
                {lastSpokenText ? `“${lastSpokenText}”` : connected ? "Hold the button, say “Pay Sharma Ji 200”" : "Start the backend to use your real voice"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
    </svg>
  );
}
