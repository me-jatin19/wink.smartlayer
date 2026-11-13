import Image from "next/image";
import LayerStack from "@/components/LayerStack";
import LiveDemo from "@/components/LiveDemo";
import Reveal from "@/components/Reveal";

const PHRASES = [
  "“Pay Sharma Ji two hundred”",
  "“Order milk and eggs from Blinkit”",
  "“Book an Uber to Terminal 3”",
  "“Send ₹500 to Mom”",
  "“Pay for this coffee”",
  "“Transfer rent to Arjun”",
];

const NAV = [
  { href: "#layers", label: "Layers" },
  { href: "#flow", label: "How it works" },
  { href: "#trust", label: "Security" },
  { href: "#demo", label: "Live demo" },
];

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <Nav />
      <Hero />
      <Marquee />
      <WhySection />
      <LayersSection />
      <FlowSection />
      <TrustSection />
      <DemoSection />
      <UseCases />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ───────────────────────────── Nav ───────────────────────────── */

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="WINK.smartlayer home">
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_24px_rgba(79,140,255,0.45)]">
        <span className="h-2.5 w-4 rounded-full border-2 border-black/80 border-t-transparent" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        WINK<span className="text-fg-dim">.smartlayer</span>
      </span>
    </a>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-4 sm:mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-2.5 sm:px-5">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-[13px] text-fg-muted hover:text-fg hover:bg-white/5 transition">
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#demo"
          className="rounded-xl bg-fg px-3.5 py-2 text-[13px] font-semibold text-bg hover:bg-white/90 transition"
        >
          Try it live
        </a>
      </div>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero() {
  return (
    <section id="top" className="relative pt-32 sm:pt-40 pb-16">
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div className="absolute left-1/2 top-24 h-[520px] w-[900px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,140,255,0.22),transparent)]" aria-hidden />
      <div className="absolute right-[8%] top-[42%] h-56 w-56 rounded-full bg-signal/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_10px_var(--signal)]" />
            The ambient payment layer for smart eyewear
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mx-auto mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
            Pay with a <span className="font-serif italic font-normal text-gradient pr-1">word.</span>
            <br />
            Verified by your <span className="font-serif italic font-normal text-gradient pr-1">voice.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-fg-muted">
            WINK turns a spoken sentence into a settled payment. No phone, no PIN, no screen to tap.
            Your voiceprint unlocks it, AI works out what you meant, and the receipt shows up in your lens.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#demo" className="group inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(79,140,255,0.4)] hover:brightness-110 transition">
              Try the live demo
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a href="#layers" className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-fg hover:bg-white/[0.07] transition">
              Explore the 5 layers
            </a>
          </div>
        </Reveal>

        {/* Product shot with HUD call-outs */}
        <Reveal delay={320} className="relative mx-auto mt-16 sm:mt-20 max-w-4xl">
          <div className="relative mx-auto aspect-[737/339] w-full max-w-[760px]">
            <div className="absolute inset-x-[10%] bottom-[-6%] h-10 rounded-[50%] bg-black/70 blur-2xl" aria-hidden />
            <div className="animate-float h-full w-full">
              <Image
                src="/glasses.png"
                alt="Smart eyewear running WINK.smartlayer"
                fill
                preload
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.7)]"
              />
            </div>

            <Callout className="left-[0%] top-[-6%] sm:left-[-4%] sm:top-[2%]" dot="var(--signal)" label="L1 · Capture" text="Hold temple to speak" />
            <Callout className="right-[0%] top-[-14%] sm:right-[-2%] sm:top-[-8%]" dot="var(--ok)" label="L3 · Voice gate" text="Owner verified ✓" />
            <Callout className="right-[4%] bottom-[-10%] sm:right-[8%] sm:bottom-[-4%]" dot="var(--accent-2)" label="L5 · HUD" text="Paid ₹200 → Sharma Ji" />
          </div>
        </Reveal>

        {/* Facts strip */}
        <Reveal delay={120} className="mx-auto mt-20 sm:mt-24 grid max-w-4xl grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            ["5", "layers, from voice to receipt"],
            ["0", "taps, PINs or screens"],
            ["1", "sentence to pay"],
            ["≥ 0.25", "cosine voice-match gate"],
          ].map(([k, v]) => (
            <div key={v} className="bg-bg px-5 py-5 text-left">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">{k}</p>
              <p className="mt-1 text-xs sm:text-[13px] text-fg-muted">{v}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Callout({ className, dot, label, text }: { className: string; dot: string; label: string; text: string }) {
  return (
    <div className={`absolute hidden sm:block rounded-2xl glass px-3.5 py-2.5 text-left shadow-2xl ${className}`}>
      <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-fg-dim">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
        {label}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-fg">{text}</p>
    </div>
  );
}

/* ───────────────────────────── Marquee ───────────────────────────── */

function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <section aria-label="Things you can say" className="relative border-y border-line py-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-marquee gap-10">
        {items.map((p, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-serif italic text-xl sm:text-2xl text-fg-muted">
            {p}
            <span className="h-1 w-1 rounded-full bg-fg-dim not-italic" />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Why ───────────────────────────── */

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em]">{title}</h2>
      {body && <p className="mt-4 text-fg-muted leading-relaxed sm:text-lg">{body}</p>}
    </Reveal>
  );
}

function WhySection() {
  const cards = [
    {
      title: "No phone",
      body: "Your hands stay on the shopping bag, the steering wheel or the coffee cup. The glasses you already wear do the job.",
      icon: (
        <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-4 18L20 3" />
      ),
    },
    {
      title: "No PIN",
      body: "Nothing to type and nothing to remember. A neural voiceprint is checked on every request.",
      icon: <path d="M12 3a4 4 0 0 1 4 4v3H8V7a4 4 0 0 1 4-4ZM6 10h12v10H6zM12 14v2" />,
    },
    {
      title: "No screen",
      body: "The confirmation appears in the corner of your vision, so you never have to look down.",
      icon: <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />,
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="Why WINK"
        title={
          <>
            Checkout should work like <span className="font-serif italic font-normal text-fg-muted">talking</span>.
          </>
        }
        body="Every payment today asks for your attention: unlock, open, scan, confirm. WINK handles all of that while you just say what you want."
      />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 90} as="article" className="group relative rounded-3xl glass p-7 overflow-hidden hover:border-line-strong transition">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {c.icon}
            </svg>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{c.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Layers ───────────────────────────── */

function LayersSection() {
  return (
    <section id="layers" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_25%_50%,rgba(79,140,255,0.08),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="The smart layer"
          title={
            <>
              Five layers.
              <br />
              <span className="text-fg-muted">One spoken sentence.</span>
            </>
          }
          body="WINK sits between your voice and your money. Each layer does one job and passes the request to the next one only if that job succeeds."
        />
        <Reveal className="mt-10">
          <LayerStack />
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Flow ───────────────────────────── */

function FlowSection() {
  return (
    <section id="flow" className="scroll-mt-24 mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="How it works"
        title={
          <>
            From sentence to <span className="font-serif italic font-normal">settlement</span>.
          </>
        }
        body="Here is the same request as it moves through the stack."
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        <Reveal as="article" className="rounded-3xl glass p-6 flex flex-col">
          <StepLabel n="01" color="var(--signal)" label="You say" />
          <div className="mt-6 flex-1 flex items-center">
            <p className="font-serif italic text-3xl sm:text-4xl leading-tight">“Pay Sharma Ji two hundred.”</p>
          </div>
          <div className="mt-6 flex h-8 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 42 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] flex-1 rounded-full bg-signal/70"
                style={{ height: `${20 + Math.abs(Math.sin(i * 1.7) * 80)}%` }}
              />
            ))}
          </div>
        </Reveal>

        <Reveal as="article" delay={100} className="rounded-3xl glass p-6 flex flex-col">
          <StepLabel n="02" color="var(--ok)" label="WINK verifies & understands" />
          <div className="mt-6 space-y-3 flex-1">
            <div className="flex items-center justify-between rounded-xl border border-ok/25 bg-ok/5 px-4 py-3">
              <span className="font-mono text-xs text-fg-muted">voiceprint ⋅ owner</span>
              <span className="font-mono text-xs text-ok">match ✓</span>
            </div>
            <pre className="rounded-xl border border-line bg-black/40 p-4 font-mono text-[12.5px] leading-relaxed text-fg-muted overflow-x-auto">
              <span className="text-fg-dim">{"{"}</span>
              {"\n  "}<span className="text-accent-2">&quot;action&quot;</span>: <span className="text-fg">&quot;PAY&quot;</span>,
              {"\n  "}<span className="text-accent-2">&quot;amount&quot;</span>: <span className="text-signal">200</span>,
              {"\n  "}<span className="text-accent-2">&quot;recipient&quot;</span>: <span className="text-fg">&quot;Sharma Ji&quot;</span>
              {"\n"}<span className="text-fg-dim">{"}"}</span>
            </pre>
          </div>
        </Reveal>

        <Reveal as="article" delay={200} className="rounded-3xl glass p-6 flex flex-col">
          <StepLabel n="03" color="var(--accent-2)" label="You see" />
          <div className="mt-6 flex-1 grid place-items-center">
            <div className="relative w-full rounded-2xl border border-accent-2/30 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(61,224,255,0.12),transparent)] p-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-2">Paid</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight">₹200</p>
              <p className="mt-1 text-sm text-fg-muted">to Sharma Ji · just now</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-fg-dim">The wallet balance and ledger update at the same moment.</p>
        </Reveal>
      </div>
    </section>
  );
}

function StepLabel({ n, color, label }: { n: string; color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs" style={{ color }}>{n}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium text-fg-muted">{label}</span>
    </div>
  );
}

/* ───────────────────────────── Trust ───────────────────────────── */

function TrustSection() {
  const points = [
    {
      title: "Voice before intent",
      body: "The biometric gate runs first. An unverified voice is rejected before the language model ever hears it.",
    },
    {
      title: "Embeddings, not recordings",
      body: "The owner is enrolled as a normalised ECAPA-TDNN speaker embedding, a vector of numbers rather than a stored voice clip.",
    },
    {
      title: "Ephemeral audio",
      body: "Each spoken request is written to a temporary file and deleted as soon as it has been processed.",
    },
    {
      title: "Strict, structured output",
      body: "The intent engine must return a fixed JSON shape (action, amount, recipient) before anything is settled.",
    },
  ];
  return (
    <section id="trust" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Security by design"
            title={
              <>
                Your voice is the key.
                <br />
                <span className="text-fg-muted">Nobody else&apos;s is.</span>
              </>
            }
            body="Anyone can say “pay two hundred”. Only the enrolled owner's voice gets past the gate."
          />
          <Reveal delay={100} className="mt-8 rounded-3xl glass p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">Cosine similarity vs. owner</p>
            <div className="mt-5 space-y-4">
              <Bar label="Owner" value={0.72} tone="ok" />
              <Bar label="Imposter" value={0.11} tone="bad" />
            </div>
            <p className="mt-4 text-xs text-fg-dim">Illustrative scores. The gate is set at 0.25.</p>
          </Reveal>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 content-center">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 80} as="article" className="rounded-3xl border border-line bg-white/[0.02] p-6">
              <span className="font-mono text-xs text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "ok" | "bad" }) {
  const color = tone === "ok" ? "var(--ok)" : "var(--bad)";
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono" style={{ color }}>{value.toFixed(2)} {tone === "ok" ? "✓" : "✕"}</span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-white/[0.06]">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${value * 100}%`, background: color, boxShadow: `0 0 16px ${color}` }} />
        <div className="absolute -top-1.5 -bottom-1.5 w-px bg-white/70" style={{ left: "25%" }} />
      </div>
    </div>
  );
}

/* ───────────────────────────── Demo ───────────────────────────── */

function DemoSection() {
  return (
    <section id="demo" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" aria-hidden />
      <div className="absolute left-1/2 top-40 h-[500px] w-[900px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,140,255,0.12),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeader
            eyebrow="Live demo"
            title={
              <>
                Hear it. <span className="font-serif italic font-normal">See it settle.</span>
              </>
            }
            body="With the WINK engine running locally, hold the button and speak a payment. Without it, run the labelled simulation to watch the same five layers."
          />
          <Reveal delay={100} className="shrink-0 rounded-2xl border border-line bg-black/30 px-4 py-3 font-mono text-[11px] text-fg-muted">
            <span className="text-fg-dim">$</span> uvicorn main:app --port 8000
          </Reveal>
        </div>
        <Reveal delay={80} className="mt-10">
          <LiveDemo />
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────────── Use cases ───────────────────────────── */

function UseCases() {
  const cases = [
    { tag: "Quick commerce", line: "“Order milk and eggs from Blinkit”", color: "#f5c542" },
    { tag: "Mobility", line: "“Book an Uber to Terminal 3”", color: "#e5e7eb" },
    { tag: "Peer-to-peer UPI", line: "“Send ₹500 to Mom”", color: "#4f8cff" },
    { tag: "Local merchants", line: "“Pay Sharma Ji two hundred”", color: "#34d399" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader eyebrow="Built for everyday" title="Wherever you'd reach for your phone." />
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cases.map((c, i) => (
          <Reveal key={c.tag} delay={i * 70} as="article" className="group relative overflow-hidden rounded-3xl border border-line bg-white/[0.02] p-7 sm:p-8 hover:bg-white/[0.04] transition">
            <span
              className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full"
              style={{ background: c.color, boxShadow: `0 0 18px ${c.color}` }}
            />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim">{c.tag}</p>
            <p className="mt-8 font-serif italic text-2xl sm:text-3xl leading-snug text-fg group-hover:translate-x-1 transition-transform">
              {c.line}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── CTA + footer ───────────────────────────── */

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
      <Reveal className="relative overflow-hidden rounded-[36px] ring-gradient bg-bg-elev px-6 py-16 sm:px-14 sm:py-20 text-center">
        <div className="absolute inset-0 bg-grid opacity-70" aria-hidden />
        <div className="absolute left-1/2 top-0 h-72 w-[700px] max-w-full -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            The last checkout you&apos;ll <span className="font-serif italic font-normal text-gradient">ever look at.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-fg-muted sm:text-lg">
            WINK.smartlayer brings voice biometrics, language understanding and payment settlement together in one layer that runs on your glasses.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#demo" className="rounded-2xl bg-fg px-6 py-3.5 text-sm font-semibold text-bg hover:bg-white/90 transition">
              Try the live demo
            </a>
            <a href="#layers" className="rounded-2xl border border-line-strong px-6 py-3.5 text-sm font-semibold hover:bg-white/5 transition">
              Revisit the layers
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Logo />
          <p className="mt-2 text-xs text-fg-dim">Autonomous, voice-authenticated ambient payments for smart eyewear.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-fg-dim">
          <span>SpeechBrain ECAPA-TDNN</span>
          <span>Gemini Flash</span>
          <span>FastAPI · WebSocket</span>
          <span>Next.js</span>
        </div>
      </div>
    </footer>
  );
}
