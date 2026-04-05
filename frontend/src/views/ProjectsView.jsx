import { useState } from "react";
import { T, SAMPLE_PROJECTS, STAGE_DEFS } from "../constants";
import { stColor, langColor } from "../utils";
import { Chip, Dot } from "../components/UI";

export default function ProjectsView({ onTrigger, runs }) {
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", repo: "", lang: "Node.js", description: "", branch: "main", env: "staging" });

  const create = () => {
    if (!form.name || !form.repo) return;
    setProjects((p) => [...p, { id: Date.now(), ...form, stages: ["build","test","sast","depcheck","docker","deploy"], status: "pending" }]);
    setOpen(false);
    setForm({ name: "", repo: "", lang: "Node.js", description: "", branch: "main", env: "staging" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Projects</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{projects.length} projects · {runs.length} total runs</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>+ New project</button>
      </div>

      {open && (
        <div style={{ background: T.bg2, border: `1px solid ${T.accentHi}50`, borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text0, marginBottom: "1rem" }}>Create project</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[["Project name","name","my-service"],["Repository","repo","github.com/org/repo"],["Branch","branch","main"],["Description","description","Service description"]].map(([l, k, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 10, color: T.text2, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</label>
                <input value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph}
                  style={{ width: "100%", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.text0, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            {[["Language","lang",["Node.js","Java","Python","Go","React","Rust","Kotlin"]],["Environment","env",["staging","production","development"]]].map(([l, k, opts]) => (
              <div key={k}>
                <label style={{ fontSize: 10, color: T.text2, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</label>
                <select value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ width: "100%", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.text0, fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={create} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Create</button>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, color: T.text2, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {projects.map((p) => {
          const last = runs.filter((r) => r.project === p.name).slice(-1)[0];
          const curSt = last?.status || p.status;
          const lc = langColor[p.lang] || T.accent;
          return (
            <div key={p.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: lc + "18", border: `1px solid ${lc}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 22, color: lc }}>◈</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text0 }}>{p.name}</span>
                  <Chip color={lc}>{p.lang}</Chip>
                  <Chip color={p.env === "production" ? T.danger : p.env === "staging" ? T.warning : T.success}>{p.env}</Chip>
                  <Dot status={curSt} pulse />
                </div>
                <div style={{ fontSize: 11, color: T.text2, marginBottom: 8, fontFamily: T.mono }}>{p.repo} · {p.branch}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {p.stages.map((sid) => {
                    const d = STAGE_DEFS.find((x) => x.id === sid);
                    return d ? <span key={sid} style={{ fontSize: 10, color: d.color, background: d.color + "15", border: `1px solid ${d.color}30`, borderRadius: 4, padding: "2px 7px" }}>{d.label}</span> : null;
                  })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: T.text2 }}>Last: {last ? "just now" : p.lastRun || "never"}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onTrigger(p, "push", "production")} style={{ background: T.dangerBg, border: `1px solid ${T.danger}40`, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 800, color: T.danger, cursor: "pointer" }}>⚡ Prod</button>
                  <button onClick={() => onTrigger(p, "manual", p.env || "staging")} style={{ background: T.accentGlow, border: `1px solid ${T.accent}40`, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 800, color: T.accentHi, cursor: "pointer" }}>▶ Run</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
