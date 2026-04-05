import { useState } from "react";
import { T, ARTIFACTS_DATA } from "../constants";
import { StatCard, Chip } from "../components/UI";

export default function ArtifactsView() {
  const [arts, setArts] = useState(ARTIFACTS_DATA);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text0, margin: "0 0 4px", letterSpacing: "-1px" }}>Artifact registry</h2>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>JFrog Artifactory · registry.devflow.io</p>
        </div>
        <Chip color={T.success}>▲ JFrog Artifactory</Chip>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
        <StatCard label="Total artifacts" value={arts.length} />
        <StatCard label="Docker images"   value={arts.filter((a) => a.type === "docker").length} color={T.cyan} />
        <StatCard label="JAR packages"    value={arts.filter((a) => a.type === "jar").length}    color={T.warning} />
        <StatCard label="Total storage"   value={arts.reduce((a, x) => a + parseInt(x.size), 0) + " MB"} />
      </div>

      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontWeight: 800, color: T.text2, textTransform: "uppercase", letterSpacing: ".08em", display: "grid", gridTemplateColumns: "1fr 100px 80px 90px 160px 80px 80px", gap: 12 }}>
          <span>Name</span><span>Version</span><span>Type</span><span>Size</span><span>Digest</span><span>Pushed</span><span>Action</span>
        </div>
        {arts.map((a) => (
          <div key={a.id} style={{ padding: "14px 1.25rem", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 100px 80px 90px 160px 80px 80px", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text0 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: T.text2 }}>{a.project}</div>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.success, background: T.successBg, padding: "2px 8px", borderRadius: 4 }}>{a.version}</span>
            <Chip color={a.type === "docker" ? T.cyan : T.warning}>{a.type === "docker" ? "Docker" : "JAR"}</Chip>
            <span style={{ fontSize: 12, color: T.text1 }}>{a.size}</span>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.text2 }}>{a.digest}</span>
            <span style={{ fontSize: 12, color: T.text2 }}>{a.pushed}</span>
            <button onClick={() => setArts((p) => p.filter((x) => x.id !== a.id))}
              style={{ fontSize: 11, color: T.danger, background: T.dangerBg, border: `1px solid ${T.danger}30`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 800 }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
