import { useState, useCallback } from "react";
import { T, NAV, STAGE_DEFS, VULN_POOL } from "./constants";
import { genId } from "./utils";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import ProjectsView from "./views/ProjectsView";
import PipelinesView from "./views/PipelinesView";
import SecurityView from "./views/SecurityView";
import ArtifactsView from "./views/ArtifactsView";
import KubernetesView from "./views/KubernetesView";
import ObservabilityView from "./views/ObservabilityView";
import Toasts from "./components/Toasts";
import ApprovalModal from "./components/ApprovalModal";
import YamlEditor from "./components/YamlEditor";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [runs, setRuns] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showYaml, setShowYaml] = useState(false);
  const [approval, setApproval] = useState(null);

  const addToast = useCallback((title, msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5500);
  }, []);

  const triggerPipeline = useCallback(
    (project, trigger, env = "staging") => {
      const id = genId();
      const hasCrit = Math.random() < 0.38;
      const hasFail = Math.random() < 0.22;
      let failed = false;
      const stages = project.stages.map((sid) => {
        if (failed) return { id: sid, status: "skipped", duration: 0 };
        let status = "success";
        if ((sid === "sast" || sid === "depcheck") && hasCrit) { status = "failed"; failed = true; }
        else if (hasFail && Math.random() < 0.14) { status = "failed"; failed = true; }
        return { id: sid, status, duration: Math.floor(Math.random() * 45) + 5 };
      });

      const vulns = [];
      if (project.stages.includes("sast")) {
        const n = Math.floor(Math.random() * 3) + (hasCrit ? 2 : 0);
        VULN_POOL.sast.slice(0, Math.min(n, VULN_POOL.sast.length)).forEach((v) => vulns.push(v));
      }
      if (project.stages.includes("depcheck")) {
        const n = Math.floor(Math.random() * 2) + (hasCrit ? 1 : 0);
        VULN_POOL.deps.slice(0, Math.min(n, VULN_POOL.deps.length)).forEach((v) => vulns.push(v));
      }

      const status = failed ? "failed" : "success";
      const run = {
        id, project: project.name, branch: project.branch,
        trigger, env, stages, status,
        duration: stages.reduce((a, s) => a + s.duration, 0),
        vulns, triggeredBy: user?.username,
      };

      if (env === "production" && !failed) {
        setApproval({ run, project });
        addToast("Approval required", `${project.name} prod deploy awaiting sign-off`, "info");
        return;
      }

      setRuns((p) => [...p, run]);
      const crit = vulns.filter((v) => v.severity === "Critical");
      if (status === "failed") {
        crit.length > 0
          ? addToast(`Security gate: ${project.name}`, `${crit.length} critical CVEs — pipeline halted`, "error")
          : addToast(`Pipeline failed: ${project.name}`, `Run #${id.substr(0, 6)} failed at ${stages.find((s) => s.status === "failed")?.id}`, "error");
      } else {
        addToast(`Pipeline succeeded: ${project.name}`, `Run #${id.substr(0, 6)} completed in ${run.duration}s`, "success");
        if (vulns.some((v) => v.severity === "High"))
          addToast(`Security warning: ${project.name}`, `${vulns.filter((v) => v.severity === "High").length} high-severity findings`, "warning");
      }
      setView("pipelines");
    },
    [addToast, user]
  );

  const approveRun = useCallback(() => {
    if (!approval) return;
    setRuns((p) => [...p, approval.run]);
    addToast(`Approved: ${approval.run.project}`, `Production deploy approved by ${user?.username}`, "success");
    setApproval(null);
    setView("pipelines");
  }, [approval, addToast, user]);

  const rejectRun = useCallback(() => {
    addToast(`Rejected: ${approval?.run?.project}`, "Production deployment was rejected", "error");
    setApproval(null);
  }, [approval, addToast]);

  if (!user) return <LoginView onLogin={setUser} />;

  const critCount = runs.flatMap((r) => r.vulns || []).filter((v) => v.severity === "Critical").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", background: T.bg0, color: T.text0 }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(0.8)}}
        @keyframes shimmer{0%{transform:translateX(-300%)}100%{transform:translateX(300%)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1E3058;border-radius:2px}
        input,select{background:#162240;border:1px solid #1E3058;color:#F0F6FF;border-radius:8px;padding:9px 12px;font-size:13px}
        input:focus,select:focus{outline:none;border-color:#3B7BF6}
        button:active{transform:scale(0.97)}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 228, background: T.bg1, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.accent + "20", border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>☸</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: T.text0, letterSpacing: "-0.5px" }}>DevFlow</div>
              <div style={{ fontSize: 9, color: T.text2, letterSpacing: ".1em", textTransform: "uppercase" }}>CI/CD · DevSecOps</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.text2, letterSpacing: ".1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Platform</div>
          {NAV.map((n) => {
            const isA = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, background: isA ? T.accent + "20" : "transparent", color: isA ? T.accentHi : T.text2, fontSize: 13, fontWeight: isA ? 800 : 400, transition: "all .12s" }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.id === "security" && critCount > 0 && <span style={{ background: T.danger, color: "#fff", borderRadius: 10, fontSize: 9, padding: "1px 6px", fontWeight: 900 }}>{critCount}</span>}
                {n.id === "pipelines" && runs.length > 0 && <span style={{ background: T.bg4, color: T.text2, borderRadius: 10, fontSize: 9, padding: "1px 6px" }}>{runs.length}</span>}
              </button>
            );
          })}

          <div style={{ borderTop: `1px solid ${T.border}`, margin: "12px 0", paddingTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.text2, letterSpacing: ".1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Tools</div>
            <button onClick={() => setShowYaml(true)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer", background: "transparent", color: T.text2, fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>&lt;/&gt;</span>YAML editor
            </button>
          </div>
        </nav>

        <div style={{ padding: "1rem", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: user.color + "25", border: `1px solid ${user.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: user.color, flexShrink: 0 }}>{user.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text0 }}>{user.username}</div>
              <div style={{ fontSize: 10, color: T.text2 }}>{user.role}</div>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.success, flexShrink: 0 }} />
          </div>
          <button onClick={() => { setUser(null); setRuns([]); }}
            style={{ width: "100%", background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 0", fontSize: 11, color: T.text2, cursor: "pointer", fontWeight: 700 }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
        {view === "dashboard"     && <DashboardView     runs={runs} onNav={setView} />}
        {view === "projects"      && <ProjectsView      runs={runs} onTrigger={triggerPipeline} />}
        {view === "pipelines"     && <PipelinesView     runs={runs} />}
        {view === "security"      && <SecurityView      runs={runs} />}
        {view === "artifacts"     && <ArtifactsView />}
        {view === "kubernetes"    && <KubernetesView />}
        {view === "observability" && <ObservabilityView runs={runs} />}
      </main>

      {showYaml  && <YamlEditor onClose={() => setShowYaml(false)} />}
      {approval  && <ApprovalModal run={approval.run} onApprove={approveRun} onReject={rejectRun} onClose={() => setApproval(null)} />}
      <Toasts items={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}
