import { useState, useEffect, useRef } from "react";
import { T } from "../constants";

const lineColor = (l) =>
  l.includes("[CRITICAL]") || l.includes("[ERROR]") || l.includes("[FAIL]") ? "#F05252"
  : l.includes("[WARN]") ? "#F59E0B"
  : l.includes("[SUCCESS]") || l.includes("[PASS]") ? "#22D3A0"
  : T.text1;

export default function LogViewer({ logs, stream }) {
  const ref = useRef();
  const [visible, setVisible] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setVisible([]); setIdx(0); }, [logs]);

  useEffect(() => {
    if (!stream) { setVisible(logs); return; }
    if (idx >= logs.length) return;
    const t = setTimeout(() => {
      setVisible((p) => [...p, logs[idx]]);
      setIdx((i) => i + 1);
    }, 260 + Math.random() * 180);
    return () => clearTimeout(t);
  }, [idx, logs, stream]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [visible]);

  const show = stream ? visible : logs;

  return (
    <div ref={ref} style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem", fontFamily: T.mono, fontSize: 12, lineHeight: 1.8, maxHeight: 260, overflowY: "auto" }}>
      {show.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <span style={{ color: T.text2, userSelect: "none", minWidth: 24, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
          <span style={{ color: lineColor(l), wordBreak: "break-all" }}>{l}</span>
        </div>
      ))}
      {stream && idx < logs.length && (
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: T.text2, minWidth: 24, textAlign: "right" }}>…</span>
          <span style={{ color: T.accent, animation: "pulse 1s ease-in-out infinite" }}>▌</span>
        </div>
      )}
    </div>
  );
}
