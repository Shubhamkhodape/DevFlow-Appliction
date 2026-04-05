import { useState } from "react";
import { T, K8S_PODS } from "../constants";
import { StatCard, Chip } from "../components/UI";
import LogViewer from "../components/LogViewer";

const POD_LOGS = {
  "api-gateway-7d9f-xkq2p": [
    "2024-01-15 10:23:01 [INFO]  Server listening on :3000",
    "2024-01-15 10:23:01 [INFO]  DB pool initialized (5 connections)",
    "2024-01-15 10:23:05 [INFO]  GET /health → 200 (1ms)",
    "2024-01-15 10:23:10 [INFO]  GET /api/v2/users → 200 (12ms)",
  ],
  "auth-service-5c8b-qr9wx": [
    "2024-01-15 10:22:44 [ERROR] Failed to connect postgres:5432 — ECONNREFUSED",
    "2024-01-15 10:22:44 [FATAL] Startup failed: database unreachable",
    "2024-01-15 10:22:44 [INFO]  Container exiting with code 1",
    "2024-01-15 10:22:49 [INFO]  Restarting container (backoff 10s, attempt 7/∞)",
  ],
};

export default function KubernetesView() {
  const [pods]    = useState(K8S_PODS);
  const [logPod, setLogPod]   = useState(null);
  const [canary, setCanary]   = useState(10);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Kubernetes cluster</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>devflow-aks-prod · East US 2 · v1.29.2</p>
        </div>
        <Chip color={T.cyan}>☸ AKS</Chip>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
        <StatCard label="Total pods" value={pods.length} />
        <StatCard label="Running"    value={pods.filter((p) => p.status === "Running").length}  color={T.success} />
        <StatCard label="Unhealthy"  value={pods.filter((p) => p.status !== "Running").length}  color={T.danger} />
        <StatCard label="Nodes"      value={3} color={T.cyan} />
      </div>

      {/* Canary traffic split */}
      <div style={{ background: T.bg2, border: `1px solid ${T.purple}40`, borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Chip color={T.purple}>Canary</Chip>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text0 }}>Traffic split — api-gateway v2.4.1</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: T.purple }}>{canary}%</span>
        </div>
        <input type="range" min={0} max={100} step={5} value={canary} onChange={(e) => setCanary(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.purple }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.text2, marginTop: 6 }}>
          <span>v2.4.0 (stable) — {100 - canary}%</span>
          <span>v2.4.1 (canary) — {canary}%</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[10, 25, 50, 100].map((pct) => (
            <button key={pct} onClick={() => setCanary(pct)}
              style={{ background: canary === pct ? T.purple + "30" : T.bg3, border: `1px solid ${canary === pct ? T.purple + "60" : T.border}`, borderRadius: 7, padding: "5px 14px", fontSize: 11, fontWeight: 800, color: canary === pct ? T.purple : T.text2, cursor: "pointer" }}>
              {pct}%
            </button>
          ))}
          <button onClick={() => setCanary(0)}
            style={{ background: T.dangerBg, border: `1px solid ${T.danger}30`, borderRadius: 7, padding: "5px 14px", fontSize: 11, fontWeight: 800, color: T.danger, cursor: "pointer" }}>
            Rollback
          </button>
        </div>
      </div>

      {/* Pods table */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontWeight: 800, color: T.text2, textTransform: "uppercase", letterSpacing: ".08em", display: "grid", gridTemplateColumns: "1fr 150px 60px 70px 80px 60px 60px 70px", gap: 8 }}>
          <span>Pod</span><span>Status</span><span>Ready</span><span>Restarts</span><span>Node</span><span>CPU</span><span>Mem</span><span>Logs</span>
        </div>
        {pods.map((p) => (
          <div key={p.name} style={{ padding: "12px 1.25rem", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 150px 60px 70px 80px 60px 60px 70px", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            <Chip color={p.status === "Running" ? T.success : T.danger}>
              {p.status === "Running" ? "● Running" : "✗ " + p.status.substr(0, 14)}
            </Chip>
            <span style={{ fontSize: 12, color: T.text1 }}>{p.ready}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: p.restarts > 3 ? T.danger : p.restarts > 0 ? T.warning : T.text2 }}>{p.restarts}</span>
            <span style={{ fontSize: 11, color: T.text2, fontFamily: T.mono }}>{p.node}</span>
            <span style={{ fontSize: 11, color: T.text2, fontFamily: T.mono }}>{p.cpu}</span>
            <span style={{ fontSize: 11, color: T.text2, fontFamily: T.mono }}>{p.mem}</span>
            <button onClick={() => setLogPod(logPod === p.name ? null : p.name)}
              style={{ fontSize: 10, color: T.accent, background: T.accentGlow, border: `1px solid ${T.accent}30`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 800 }}>
              Logs
            </button>
          </div>
        ))}
      </div>

      {logPod && (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Chip color={T.accent}>stdout</Chip>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text1 }}>{logPod}</span>
          </div>
          <LogViewer logs={POD_LOGS[logPod] || ["No logs available"]} />
        </div>
      )}
    </div>
  );
}
