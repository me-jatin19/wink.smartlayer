"use client";

import { useState, useRef, useEffect } from "react";

type StepStatus = "idle" | "recording" | "biometrics" | "gemini" | "complete" | "denied";

interface Transaction {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "debit" | "credit";
  iconBg: string;
}

export default function WinkAmbientExperience() {
  const [balance, setBalance] = useState<number>(5750);
  const [displayBalance, setDisplayBalance] = useState<number>(5750);
  const [isDeducting, setIsDeducting] = useState<boolean>(false);

  const [step, setStep] = useState<StepStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("Smart Eyewear Ready");
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState<string>("");

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      title: "Blinkit Instant",
      category: "Organic Milk & Apples",
      date: "Today, 2:14 PM",
      amount: 139,
      type: "debit",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: 2,
      title: "Uber Premier",
      category: "Drop to Airport Terminal 3",
      date: "Yesterday",
      amount: 380,
      type: "debit",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    {
      id: 3,
      title: "Cashback from WINK",
      category: "50% Optical Launch Reward",
      date: "2 Oct 2026",
      amount: 50,
      type: "credit",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: 4,
      title: "Sharma Ji Grocery",
      category: "Direct Voice UPI",
      date: "28 Sep 2026",
      amount: 500,
      type: "debit",
      iconBg: "bg-sky-50 text-sky-600",
    },
  ]);

  const ws = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rot = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 75;

      rot += 0.012;

      ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const currentR = r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);

        ctx.strokeStyle = "rgba(59, 130, 246, 0.18)";
        ctx.beginPath();
        ctx.ellipse(cx, y, currentR, currentR * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let lon = 0; lon < 180; lon += 30) {
        const rad = ((lon + rot * 40) * Math.PI) / 180;
        const xOffset = Math.sin(rad) * r;

        ctx.strokeStyle = Math.cos(rad) > 0 ? "rgba(96, 165, 250, 0.3)" : "rgba(37, 99, 235, 0.1)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(xOffset), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (displayBalance === balance) {
      setIsDeducting(false);
      return;
    }

    setIsDeducting(true);
    const startValue = displayBalance;
    const endValue = balance;
    const duration = 1200;
    const startTime = performance.now();

    const updateTicker = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      const currentVal = Math.round(startValue - (startValue - endValue) * easeOut);

      setDisplayBalance(currentVal);

      if (progressRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(updateTicker);
      } else {
        setDisplayBalance(endValue);
        setIsDeducting(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTicker);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [balance]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    ws.current = socket;

    socket.onopen = () => setStatusMessage("Optical Bus Synced • PTT Ready");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "BIOMETRIC_DENIED") {
          setStep("denied");
          setSimilarityScore(data.score);
          setStatusMessage("Voice Mismatch (" + (data.score * 100).toFixed(0) + "%)");
          setTimeout(() => setStep("idle"), 3000);
        } else if (data.type === "BIOMETRIC_ACCEPTED") {
          setStep("gemini");
          setSimilarityScore(data.score);
          setStatusMessage("Voice Authenticated • NLU Extraction...");
        } else if (data.type === "EXECUTE_TRANSACTION") {
          const payload = data.payload;
          setStep("complete");

          const costVal = payload.amount || (payload.action === "PAY" ? 200 : 150);
          const rawText = payload.transcription || "Voice checkout";
          setLastSpokenText(rawText);

          let title = payload.recipient || "Autonomous Pay";
          let category = "Instant Settlement";
          let iconBg = "bg-blue-50 text-blue-600";

          if (/blinkit|milk|bread|eggs|grocery|apples/i.test(rawText)) {
            title = "Blinkit Instant";
            category = "Grocery Basket";
            iconBg = "bg-amber-50 text-amber-600";
          } else if (/uber|cab|ride|ola|drive/i.test(rawText)) {
            title = "Uber Premier";
            category = "Ride Allocation";
            iconBg = "bg-slate-100 text-slate-800";
          }

          setBalance((prev) => Math.max(0, prev - costVal));
          setTransactions((prev) => [
            {
              id: Date.now(),
              title,
              category,
              date: "Just now",
              amount: costVal,
              type: "debit",
              iconBg,
            },
            ...prev,
          ]);

          setStatusMessage("Settlement Displayed in Eyewear HUD");
          setTimeout(() => setStep("idle"), 3500);
        }
      } catch {
        setStatusMessage("Signal processing error");
      }
    };

    socket.onclose = () => setStatusMessage("Eyewear Offline");
    return () => socket.close();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setStep("idle");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 2500) {
          setStep("idle");
          return;
        }

        setStep("biometrics");
        setStatusMessage("Extracting ECAPA Embeddings...");

        const arrayBuffer = await audioBlob.arrayBuffer();
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(arrayBuffer);
        }
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(250);
      setStep("recording");
      setLastSpokenText("");
      setStatusMessage("Listening from Dual Frame Mics...");
    } catch {
      setStatusMessage("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3F8] text-slate-800 font-sans antialiased flex flex-col justify-between p-4 sm:p-8 select-none">
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            W
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-slate-900 block leading-tight">
              WINK<span className="text-blue-600">.smartlayer</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              Micro-OLED Ambient Neural Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <span className={"w-2 h-2 rounded-full " + (ws.current && ws.current.readyState === 1 ? "bg-emerald-500 animate-pulse" : "bg-amber-400 animate-ping")} />
          <span className="font-mono text-[11px]">{ws.current && ws.current.readyState === 1 ? "Optics Synced" : "Connecting Core"}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#0B0F19] rounded-[32px] p-6 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[390px]">
            <div className="flex justify-between items-start z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
                  Frame Array • Model AirGo
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Dual-Beamforming Lens Perspective
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] bg-blue-950/70 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                42° Waveguide FOV
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none">
              <canvas ref={globeCanvasRef} width={260} height={260} className="w-[210px] h-[210px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center my-4">
              <div className="relative">
                <img
                  src="/glasses.png"
                  alt="WINK Smart Eyewear"
                  className={"w-[440px] max-w-full object-contain transition-all duration-300 " + (step === "recording" ? "scale-105 drop-shadow-[0_0_30px_rgba(59,130,246,0.7)]" : "drop-shadow-xl")}
                />
                <div className="absolute -top-2 right-14 flex items-center gap-1.5 bg-blue-600/95 border border-blue-400 text-white px-2.5 py-0.5 rounded-full shadow-lg text-[10px] font-mono font-semibold pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Right Temple PTT</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center z-10 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={"w-2 h-2 rounded-full " + (
                  step === "recording" ? "bg-rose-500 animate-ping" : step === "biometrics" ? "bg-amber-400 animate-bounce" : "bg-blue-500"
                )} />
                <span className="text-slate-300 font-semibold">{statusMessage}</span>
              </div>
              {similarityScore !== null && (
                <span className={"font-mono text-[11px] font-bold px-2 py-0.5 rounded " + (
                  similarityScore >= 0.25 ? "text-emerald-400 bg-emerald-950/60" : "text-rose-400 bg-rose-950/60"
                )}>
                  Match: {(similarityScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Model</span>
              <span className="text-xs font-extrabold text-slate-900 mt-1 block font-mono">ECAPA-TDNN</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">NLU Engine</span>
              <span className="text-xs font-extrabold text-blue-600 mt-1 block font-mono">Gemini 2.5 Flash</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Biometric Gate</span>
              <span className="text-xs font-extrabold text-emerald-600 mt-1 block font-mono">Threshold 0.25</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[330px] sm:w-[350px] bg-white rounded-[44px] shadow-[0_25px_70px_rgba(0,0,0,0.12)] border-[8px] border-slate-900 p-5 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 px-2 pt-1 pb-3 font-mono">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px]">5G</span>
                  <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
                    <div className="w-3 h-1.5 bg-slate-900 rounded-2xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1 px-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm">
                  ←
                </div>
                <h3 className="font-extrabold text-base text-slate-900">My Wallet</h3>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold font-mono">
                  JS
                </div>
              </div>

              <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#2563EB] via-[#3B82F6] to-[#60A5FA] p-5 text-white shadow-xl shadow-blue-500/25">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 opacity-90 font-mono">Current Balance</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black tracking-tight tabular-nums font-mono">
                        ${displayBalance.toLocaleString("en-US")}
                      </span>
                      {isDeducting && (
                        <span className="text-[9px] font-bold bg-white/20 border border-white/30 px-1.5 py-0.5 rounded-full animate-pulse ml-1 font-mono">
                          Live Sync
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-black tracking-tight bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md font-mono">
                    WINK
                  </span>
                </div>

                <div className="mt-6 flex justify-between items-end text-xs font-mono tracking-widest text-blue-100">
                  <span>5282 3456 7890 1289</span>
                  <span className="text-[11px] font-bold">09/28</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center px-1 mb-2">
                  <h4 className="text-xs font-black text-slate-900">Recent Transaction</h4>
                  <span className="text-[10px] font-bold text-blue-600 cursor-pointer">See All</span>
                </div>

                <div className="space-y-1.5">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={"w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs " + tx.iconBg}>
                          {tx.title.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{tx.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={"text-xs font-black tabular-nums " + (tx.type === "credit" ? "text-emerald-600" : "text-slate-900")}>
                          {tx.type === "credit" ? "+" : "-"}${tx.amount}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2 pl-1 truncate max-w-[170px]">
                  <div className={"w-2 h-2 rounded-full " + (
                    step === "recording" ? "bg-rose-500 animate-ping" : step === "biometrics" || step === "gemini" ? "bg-amber-400 animate-bounce" : "bg-cyan-400"
                  )} />
                  <div className="truncate">
                    <p className="text-[10px] font-bold truncate text-slate-200 font-mono">{statusMessage}</p>
                    {similarityScore !== null && (
                      <p className="text-[9px] text-emerald-400 font-mono">{(similarityScore * 100).toFixed(0)}% Match</p>
                    )}
                  </div>
                </div>

                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={"px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer " + (
                    step === "recording"
                      ? "bg-rose-500 text-white scale-105"
                      : step === "biometrics" || step === "gemini"
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  )}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 02-3-3V5a3 3 0 116 0v6a3 3 0 02-3 3z" />
                  </svg>
                  <span>{step === "recording" ? "Rec..." : "PTT"}</span>
                </button>
              </div>

              {lastSpokenText && (
                <p className="text-[9px] text-center text-slate-500 italic mt-1.5 truncate">
                  "{lastSpokenText}"
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto w-full pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-medium font-mono">
        <span>WINK Pay × Autonomous Smart Eyewear Interface</span>
        <span className="text-[10px]">VER 2.5 • SPEECHBRAIN × GEMINI FLASH</span>
      </footer>
    </div>
  );
}
