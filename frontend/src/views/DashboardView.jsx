import { T, K8S_PODS } from "../constants";
import { sevColor, stColor } from "../utils";
import { StatCard, Chip, Dot, Pill } from "../components/UI";

export default function DashboardView({ runs, onNav }) {
  const total = runs.length;
  const success = runs.filter((r) => r.status === "success").length;
  const failed = total - success;
  const rate = total ? Math.round((success / total) * 100) : 0;
  const avgDur = total ? Math.round(runs.reduce((a, r) => a + r.duration, 0) / total) : 0;
  const critVulns = runs.flatMap((r) => r.vulns || []).filter((v) => v.severity === "Critical").length;

  const dora = [
    { label: "Lead time",         value: "2.4h",                                                   sub: "Commit → prod",     ok: true },
    { label: "Deploy frequency",  value: `${total}`,                                               sub: "This session",      ok: true },
    { label: "Change fail rate",  value: total ? `${Math.round((failed / total) * 100)}%` : "0%", sub: "Failed pipelines",  ok: failed === 0 },
    { label: "MTTR",              value: "~4m",                                                     sub: "Mean time to recover", ok: true },
  ];

  const allVulns = runs.flatMap((r) => r.vulns || []);
  const maxVulns = Math.max(allVulns.length, 1);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Platform overview</h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>DevFlow CI/CD · All projects · Live</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <StatCard label="Success rate"  value={`${rate}%`}   sub={`${success}/${total} runs`} color={rate >= 70 ? T.success : T.danger} icon="✓" />
        <StatCard label="Failed builds" value={failed}        sub="Need attention"              color={failed > 0 ? T.danger : T.success} icon="✗" />
        <StatCard label="Avg duration"  value={`${avgDur}s`} sub="Per run" icon="⏱" />
        <StatCard label="Critical vulns" value={critVulns}   sub="All runs" color={critVulns > 0 ? T.danger : T.success} icon="⚠" />
      </div>

      {/* DORA */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text0 }}>DORA metrics</span>
          <Chip color={T.purple}>Elite performer</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {dora.map((m) => (
            <div key={m.label} style={{ background: T.bg3, borderRadius: 10, padding: "1rem", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.text2, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: m.ok ? T.success : T.danger, marginBottom: 2, letterSpacing: "-0.5px" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: T.text2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
        {/* Security summary */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text0, marginBottom: 16 }}>Security scan summary</div>
          {["Critical", "High", "Medium", "Low"].map((sev) => {
            const cnt = allVulns.filter((v) => v.severity === sev).length;
            return (
              <div key={sev} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: sevColor(sev), width: 52, textTransform: "uppercase", letterSpacing: ".04em" }}>{sev}</span>
                <div style={{ flex: 1, height: 7, background: T.bg3, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${cnt ? (cnt / maxVulns) * 100 : 0}%`, height: "100%", background: sevColor(sev), borderRadius: 4, transition: "width .6s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: cnt > 0 ? sevColor(sev) : T.text2, minWidth: 22, textAlign: "right" }}>{cnt}</span>
              </div>
            );
          })}
        </div>

        {/* K8s cluster */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text0 }}>Kubernetes cluster</span>
            <Chip color={T.cyan}>☸ AKS</Chip>
          </div>
          {K8S_PODS.slice(0, 5).map((p) => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 230 }}>{p.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Dot status={p.status === "Running" ? "success" : "failed"} />
                <span style={{ fontSize: 10, fontWeight: 800, color: p.status === "Running" ? T.success : T.danger }}>{p.status === "Running" ? "OK" : "ERR"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent runs */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text0, marginBottom: 16 }}>Recent pipeline runs</div>
        {runs.length === 0
          ? <div style={{ textAlign: "center", padding: "2.5rem", color: T.text2, fontSize: 13 }}><div style={{ fontSize: 36, marginBottom: 10, opacity: .3 }}>⟶</div>No runs yet — go to Projects and trigger a pipeline</div>
          : [...runs].reverse().slice(0, 8).map((r) => (
            <div key={r.id} onClick={() => onNav("pipelines")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
              <Dot status={r.status} pulse />
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, minWidth: 80 }}>#{r.id.substr(0, 8)}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.text0 }}>{r.project}</span>
              <Chip color={r.env === "production" ? T.danger : T.warning}>{r.env || "staging"}</Chip>
              <span style={{ fontSize: 12, color: T.text2 }}>{r.trigger}</span>
              <span style={{ fontSize: 12, color: T.text2 }}>{r.duration}s</span>
              <Pill color={stColor(r.status)}>{r.status}</Pill>
            </div>
          ))
        }
      </div>
    </div>
  );
}
