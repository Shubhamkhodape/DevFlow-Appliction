import { T } from "../constants";
import { SevBadge, CvssBar } from "./UI";

export default function CveDrawer({ vuln, onClose }) {
  if (!vuln) return null;
  const rows = [
    ["ID", vuln.id],
    ["CVE / CWE", vuln.cve || vuln.cwe || "—"],
    ["Tool", vuln.tool],
    vuln.file ? ["Location", `${vuln.file}:${vuln.line}`] : null,
    vuln.pkg  ? ["Package", vuln.pkg] : null,
    vuln.fix  ? ["Fix", vuln.fix] : null,
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
      <div style={{ background: T.bg1, borderLeft: `1px solid ${T.borderHi}`, width: 420, height: "100%", overflowY: "auto", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <SevBadge sev={vuln.severity} />
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text0, marginTop: 10, lineHeight: 1.4 }}>{vuln.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ padding: "10px 14px", background: T.bg2, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.text2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 13, color: T.text0, fontFamily: k === "Location" || k === "Package" ? T.mono : "inherit", wordBreak: "break-all" }}>{v}</div>
            </div>
          ))}
          {vuln.cvss != null && (
            <div style={{ padding: "10px 14px", background: T.bg2, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.text2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>CVSS Score</div>
              <CvssBar score={vuln.cvss} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
