import { T, STAGE_DEFS } from "../constants";
import { stColor, stBg } from "../utils";
import { Dot } from "./UI";

export default function PipelineFlow({ stages, activeStage, onClickStage }) {
  const maxDur = Math.max(...stages.map((s) => s.duration || 1), 1);
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, minWidth: "max-content" }}>
        {stages.map((s, i) => {
          const def = STAGE_DEFS.find((d) => d.id === s.id);
          if (!def) return null;
          const sc = stColor(s.status);
          const isActive = activeStage === s.id;
          const isRunning = s.status === "running";
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div onClick={() => onClickStage(s.id)}
                style={{ cursor: "pointer", background: isActive ? stBg(s.status) : T.bg3, border: `1.5px solid ${isActive ? sc : T.border}`, borderRadius: 12, padding: "14px 16px", minWidth: 110, transition: "all .14s", position: "relative", overflow: "hidden" }}>
                {isRunning && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.bg3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "40%", background: T.accent, animation: "shimmer 1.4s ease-in-out infinite" }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 17, color: def.color }}>{def.icon}</span>
                  {isRunning && <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent, animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.text0, marginBottom: 4 }}>{def.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: s.duration > 0 ? 4 : 0 }}>
                  <Dot status={s.status} />
                  <span style={{ fontSize: 10, color: sc, fontWeight: 700, textTransform: "capitalize" }}>{s.status}</span>
                </div>
                {s.duration > 0 && <div style={{ fontSize: 10, color: T.text2 }}>{s.duration}s</div>}
                {s.duration > 0 && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: T.bg0 }}>
                    <div style={{ height: "100%", width: `${(s.duration / maxDur) * 100}%`, background: def.color + "80", borderRadius: 2 }} />
                  </div>
                )}
              </div>
              {i < stages.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 20, height: 1.5, background: s.status === "success" ? T.success + "50" : s.status === "failed" ? T.danger + "40" : T.border }} />
                  <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `5px solid ${s.status === "success" ? T.success + "50" : s.status === "failed" ? T.danger + "40" : T.border}` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
