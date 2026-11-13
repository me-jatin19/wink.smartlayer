"use client";

import { useEffect, useState } from "react";
import { LAYERS } from "./layers";

/**
 * Exploded isometric view of the five WINK layers with a detail panel.
 * Auto-cycles until the visitor picks a layer.
 */
export default function LayerStack() {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned) return;
    const t = setInterval(() => setActive((a) => (a + 1) % LAYERS.length), 3800);
    return () => clearInterval(t);
  }, [pinned]);

  const select = (i: number) => {
    setActive(i);
    setPinned(true);
  };

  const layer = LAYERS[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
      {/* Isometric stack */}
      <div className="lg:col-span-6 relative h-[420px] sm:h-[480px] flex items-center justify-center [perspective:1600px]">
        <div
          className="relative w-[210px] h-[210px] sm:w-[250px] sm:h-[250px] [transform-style:preserve-3d]"
          style={{ transform: "rotateX(58deg) rotateZ(-42deg)" }}
        >
          {/* bottom = L5, top = L1 so the stack reads top-down like the pipeline */}
          {LAYERS.map((l, i) => {
            const level = LAYERS.length - 1 - i;
            const isActive = i === active;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => select(i)}
                onMouseEnter={() => select(i)}
                aria-label={`${l.index} ${l.name}`}
                className="absolute inset-0 rounded-[28px] cursor-pointer transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] focus-visible:outline-none"
                style={{
                  transform: `translateZ(${level * 62 + (isActive ? 26 : 0)}px)`,
                  background: isActive
                    ? `linear-gradient(135deg, ${l.color}38, ${l.color}0d 60%)`
                    : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
                  border: `1px solid ${isActive ? l.color : "rgba(255,255,255,0.12)"}`,
                  boxShadow: isActive
                    ? `0 0 60px ${l.color}55, inset 0 0 40px ${l.color}22`
                    : "0 20px 40px rgba(0,0,0,0.45)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span className="absolute inset-5 rounded-[18px] border border-dashed border-white/10" />
                <span
                  className="absolute left-5 top-4 font-mono text-[11px] font-semibold tracking-widest"
                  style={{ color: isActive ? l.color : "rgba(255,255,255,0.35)" }}
                >
                  {l.index}
                </span>
                <span
                  className="absolute right-5 bottom-4 h-2 w-2 rounded-full"
                  style={{ background: isActive ? l.color : "rgba(255,255,255,0.2)" }}
                />
              </button>
            );
          })}
        </div>

        {/* signal beam */}
        <div className="pointer-events-none absolute left-1/2 top-[6%] bottom-[6%] w-px -translate-x-1/2 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <div
            className="absolute inset-x-0 top-0 h-1/3 animate-scan"
            style={{ background: `linear-gradient(to bottom, transparent, ${layer.color}, transparent)` }}
          />
        </div>
      </div>

      {/* Layer list + detail */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <ol className="flex flex-col gap-1.5" role="tablist" aria-label="WINK layers">
          {LAYERS.map((l, i) => {
            const isActive = i === active;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => select(i)}
                  className={
                    "group w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all duration-300 cursor-pointer " +
                    (isActive ? "bg-surface-strong" : "hover:bg-surface")
                  }
                >
                  <span
                    className="font-mono text-xs w-7 shrink-0 transition-colors"
                    style={{ color: isActive ? l.color : "var(--fg-dim)" }}
                  >
                    {l.index}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={"block text-[15px] font-semibold transition-colors " + (isActive ? "text-fg" : "text-fg-muted group-hover:text-fg")}>
                      {l.name}
                    </span>
                    <span className="block text-xs text-fg-dim truncate">{l.tagline}</span>
                  </span>
                  <span className="relative h-1 w-14 rounded-full bg-white/5 overflow-hidden shrink-0">
                    {isActive && (
                      <span
                        key={`${active}-${pinned}`}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: l.color,
                          width: pinned ? "100%" : undefined,
                          animation: pinned ? undefined : "grow 3.8s linear forwards",
                        }}
                      />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div key={layer.id} className="glass rounded-3xl p-6 sm:p-7 animate-[fadeUp_.5s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full" style={{ background: layer.color, boxShadow: `0 0 12px ${layer.color}` }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: layer.color }}>
              {layer.index} · {layer.name}
            </span>
          </div>
          <p className="text-fg-muted leading-relaxed text-[15px]">{layer.description}</p>
          <dl className="mt-5 grid grid-cols-3 gap-2">
            {layer.specs.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-black/20 px-3 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-fg-dim">{s.label}</dt>
                <dd className="mt-1 text-[12.5px] font-medium text-fg leading-snug">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
