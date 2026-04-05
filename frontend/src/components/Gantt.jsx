import { T, STAGE_DEFS } from "../constants";

export default function Gantt({ stages }) {
  const maxDur = Math.max(...stages.map((s) => s.duration || 1), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stages.filter((s) => s.duration > 0).map((s) => {
        const def = STAGE_DEFS.find((d) => d.id === s.id);
        const pct = Math.round((s.duration / maxDur) * 100);
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: T.text1, width: 78, flexShrink: 0, textAlign: "right" }}>{def?.label}</span>
            <div style={{ flex: 1, height: 18, background: T.bg3, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: def?.color + "90", borderRadius: 5, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>{s.duration}s</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
