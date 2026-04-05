import { useState, useMemo, useEffect } from "react";
import { T, STAGE_DEFS } from "../constants";
import { stColor, genLogs } from "../utils";
import { Chip, Dot, Pill, SevBadge, CvssBar } from "../components/UI";
import PipelineFlow from "../components/PipelineFlow";
import Gantt from "../components/Gantt";
import LogViewer from "../components/LogViewer";

export default function PipelinesView({ runs }) {
  const [sel, setSel] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [tab, setTab] = useState("flow");

  const run = useMemo(
    () => (sel ? runs.find((r) => r.id === sel) : runs.length > 0 ? runs[runs.length - 1] : null),
    [sel, runs]
  );

  useEffect(() => { setActiveStage(null); }, [run?.id]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Pipeline runs</h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{runs.length} total runs this session</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "256px 1fr", gap: 16 }}>
        {/* History list */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem", overflowY: "auto", maxHeight: 700 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.text2, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12 }}>Run history</div>
          {[...runs].reverse().map((r) => {
            const isA = sel === r.id || (!sel && r === runs[runs.length - 1]);
            return (
              <div key={r.id} onClick={() => setSel(r.id)}
                style={{ padding: "10px 12px", borderRadius: 10, marginBottom: 6, cursor: "pointer", background: isA ? T.bg4 : "transparent", border: `1px solid ${isA ? T.accentHi + "40" : "transparent"}`, transition: "all .12s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <Dot status={r.status} pulse />
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent }}>#{r.id.substr(0, 8)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text0, marginBottom: 2 }}>{r.project}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>{r.trigger} · {r.duration}s</span>
                  <Pill color={stColor(r.status)}>{r.status}</Pill>
                </div>
              </div>
            );
          })}
          {runs.length === 0 && <div style={{ textAlign: "center", padding: "2rem 0", color: T.text2, fontSize: 12 }}>No runs yet</div>}
        </div>

        {/* Detail panel */}
        <div>
          {run ? (
            <>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: T.text0, letterSpacing: "-0.5px" }}>{run.project}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent }}>#{run.id}</span>
                      <Chip color={run.env === "production" ? T.danger : T.warning}>{run.env || "staging"}</Chip>
                    </div>
                    <div style={{ fontSize: 12, color: T.text2 }}>Trigger: {run.trigger} · Branch: {run.branch} · Duration: {run.duration}s</div>
                  </div>
                  <Pill color={stColor(run.status)}>{run.status}</Pill>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: "1rem", background: T.bg3, borderRadius: 9, padding: 4 }}>
                  {["flow", "timeline", "logs"].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      style={{ flex: 1, background: tab === t ? T.bg4 : "none", border: tab === t ? `1px solid ${T.border}` : "none", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: tab === t ? 800 : 400, color: tab === t ? T.text0 : T.text2, cursor: "pointer", textTransform: "capitalize", transition: "all .12s" }}>
                      {t}
                    </button>
                  ))}
                </div>

                {tab === "flow"     && <PipelineFlow stages={run.stages} activeStage={activeStage} onClickStage={(sid) => setActiveStage(activeStage === sid ? null : sid)} />}
                {tab === "timeline" && <Gantt stages={run.stages} />}
                {tab === "logs"     && activeStage && <LogViewer logs={genLogs(activeStage, run.stages.find((s) => s.id === activeStage)?.status, run.project)} stream />}
                {tab === "logs"     && !activeStage && <div style={{ textAlign: "center", padding: "1.5rem", color: T.text2, fontSize: 13 }}>Switch to Flow, click a stage, then come back to Logs</div>}
              </div>

              {tab === "flow" && activeStage && (
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Chip color={T.accent}>stdout</Chip>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.text0 }}>{STAGE_DEFS.find((s) => s.id === activeStage)?.label}</span>
                  </div>
                  <LogViewer logs={genLogs(activeStage, run.stages.find((s) => s.id === activeStage)?.status, run.project)} stream />
                </div>
              )}

              {run.vulns?.length > 0 && (
                <div style={{ background: T.dangerBg, border: `1px solid ${T.danger}40`, borderRadius: 12, padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 14 }}>⚠</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.danger }}>Security findings ({run.vulns.length})</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {run.vulns.map((v) => (
                      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: T.bg2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                        <SevBadge sev={v.severity} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text0 }}>{v.title}</div>
                          <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>{v.tool} · {v.file || v.pkg}</div>
                        </div>
                        {v.cvss != null && <CvssBar score={v.cvss} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: T.text2, fontSize: 14 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 14, opacity: .2 }}>⟶</div>
                Select a run or trigger a pipeline from Projects
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
