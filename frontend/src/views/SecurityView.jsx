import { useState } from "react";
import { T } from "../constants";
import { sevColor } from "../utils";
import { StatCard, SevBadge, CvssBar } from "../components/UI";
import CveDrawer from "../components/CveDrawer";

export default function SecurityView({ runs }) {
  const [selV, setSelV] = useState(null);
  const [filt, setFilt] = useState("All");

  const all = runs.flatMap((r) =>
    (r.vulns || []).map((v) => ({ ...v, runId: r.id.substr(0, 8), project: r.project }))
  );
  const shown = filt === "All" ? all : all.filter((v) => v.severity === filt);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Security center</h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Veracode SAST · Snyk Dependency · CVSS scoring</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
        {["Critical", "High", "Medium", "Low"].map((s) => (
          <StatCard key={s} label={s} value={all.filter((v) => v.severity === s).length} color={sevColor(s)} />
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {["All", "Critical", "High", "Medium", "Low"].map((f) => (
          <button key={f} onClick={() => setFilt(f)}
            style={{ background: filt === f ? sevColor(f) + "20" : T.bg2, border: `1px solid ${filt === f ? sevColor(f) + "50" : T.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 800, color: filt === f ? (f === "All" ? T.text0 : sevColor(f)) : T.text2, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Findings table */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontWeight: 800, color: T.text2, textTransform: "uppercase", letterSpacing: ".08em", display: "grid", gridTemplateColumns: "90px 60px 1fr 120px 90px 80px", gap: 12 }}>
          <span>Severity</span><span>ID</span><span>Finding</span><span>Tool</span><span>Project</span><span>CVSS</span>
        </div>
        {shown.length === 0
          ? (
            <div style={{ padding: "3rem", textAlign: "center", color: T.text2, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: .3 }}>✓</div>
              No {filt !== "All" ? filt.toLowerCase() : ""} vulnerabilities found
            </div>
          )
          : shown.map((v, i) => (
            <div key={i} onClick={() => setSelV(v)}
              style={{ padding: "12px 1.25rem", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "90px 60px 1fr 120px 90px 80px", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <SevBadge sev={v.severity} />
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent }}>{v.id}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text0 }}>{v.title}</div>
                <div style={{ fontSize: 11, color: T.text2 }}>{v.file || v.pkg}</div>
              </div>
              <span style={{ fontSize: 11, color: T.text1 }}>{v.tool}</span>
              <span style={{ fontSize: 11, color: T.text1 }}>{v.project}</span>
              {v.cvss != null ? <CvssBar score={v.cvss} /> : <span style={{ color: T.text2 }}>—</span>}
            </div>
          ))
        }
      </div>

      {selV && <CveDrawer vuln={selV} onClose={() => setSelV(null)} />}
    </div>
  );
}
