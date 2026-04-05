import { T, K8S_PODS, ARTIFACTS_DATA, SAMPLE_PROJECTS } from "../constants";
import { now } from "../utils";
import { StatCard, Chip } from "../components/UI";
import LogViewer from "../components/LogViewer";

export default function ObservabilityView({ runs }) {
  const total   = runs.length;
  const success = runs.filter((r) => r.status === "success").length;
  const rate    = total ? Math.round((success / total) * 100) : 0;
  const avgDur  = total ? Math.round(runs.reduce((a, r) => a + r.duration, 0) / total) : 0;

  const freq   = SAMPLE_PROJECTS.map((p) => ({ name: p.name, cnt: runs.filter((r) => r.project === p.name).length }));
  const maxF   = Math.max(...freq.map((b) => b.cnt), 1);

  const promMetrics = [
    { m: "ci_build_duration_seconds_avg", v: `${avgDur}`, u: "s" },
    { m: "ci_success_total",              v: `${success}` },
    { m: "ci_failure_total",              v: `${total - success}` },
    { m: "k8s_pods_running",              v: `${K8S_PODS.filter((p) => p.status === "Running").length}` },
    { m: "k8s_pods_unhealthy",            v: `${K8S_PODS.filter((p) => p.status !== "Running").length}` },
    { m: "security_critical_total",       v: `${runs.flatMap((r) => r.vulns || []).filter((v) => v.severity === "Critical").length}` },
    { m: "artifacts_pushed_total",        v: `${ARTIFACTS_DATA.length}` },
  ];

  const logStream = [
    `${now()} [INFO]  api-gateway: health check passed (1ms)`,
    `${now()} [INFO]  prometheus: scraping /metrics (412 series)`,
    `${now()} [INFO]  cortex: ingesting metrics to long-term store`,
    `${now()} [WARN]  auth-service: pod CrashLoopBackOff — restart #7`,
    `${now()} [INFO]  redis: replication lag 0ms`,
    ...runs.slice(-4).map((r) => `${now()} [INFO]  pipeline/${r.project}: #${r.id.substr(0, 8)} → ${r.status.toUpperCase()}`),
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Observability</h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Prometheus · Cortex · Centralized logging</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
        <StatCard label="Success rate"     value={`${rate}%`}   color={rate >= 70 ? T.success : T.danger} />
        <StatCard label="Avg duration"     value={`${avgDur}s`} />
        <StatCard label="Deploy frequency" value={total}         sub="This session" />
        <StatCard label="MTTR"             value="~4m"           sub="Mean time to recover" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Build frequency bars */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text0, marginBottom: 16 }}>Build frequency</div>
          {freq.map((b) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: T.text1, width: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
              <div style={{ flex: 1, height: 8, background: T.bg3, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${maxF > 0 ? (b.cnt / maxF) * 100 : 0}%`, height: "100%", background: T.accent, borderRadius: 4, transition: "width .5s" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text0, minWidth: 20, textAlign: "right" }}>{b.cnt}</span>
            </div>
          ))}
        </div>

        {/* Prometheus metrics */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text0 }}>Prometheus metrics</span>
            <Chip color={T.warning}>● Live</Chip>
          </div>
          {promMetrics.map((m) => (
            <div key={m.m} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent }}>{m.m}</span>
              <span style={{ fontWeight: 800, color: T.text0 }}>{m.v}{m.u || ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live log stream */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text0 }}>Centralized log stream</span>
          <Chip color={T.success}>● Streaming</Chip>
        </div>
        <LogViewer stream logs={logStream} />
      </div>
    </div>
  );
}
