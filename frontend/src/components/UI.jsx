import { T } from "../constants";
import { sevColor, sevBg, stColor } from "../utils";

export const Chip = ({ children, color = T.accent }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color, background: color + "18", border: `1px solid ${color}35`, borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap" }}>{children}</span>
);

export const Pill = ({ children, color }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", whiteSpace: "nowrap" }}>{children}</span>
);

export const Dot = ({ status, pulse: doPulse }) => {
  const c = stColor(status);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, flexShrink: 0 }}>
      {doPulse && status === "running" && <span style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: c + "30", animation: "pulse 1.5s ease-in-out infinite" }} />}
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c }} />
    </span>
  );
};

export const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1rem 1.25rem", flex: 1, minWidth: 130 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: T.text1 }}>{label}</span>
      {icon && <span style={{ fontSize: 14, color: T.text2 }}>{icon}</span>}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || T.text0, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.text2 }}>{sub}</div>}
  </div>
);

export const SevBadge = ({ sev }) => (
  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: sevColor(sev), background: sevBg(sev), border: `1px solid ${sevColor(sev)}35`, borderRadius: 4, padding: "2px 8px" }}>{sev}</span>
);

export const CvssBar = ({ score }) => {
  const c = score >= 9 ? "#F05252" : score >= 7 ? "#F59E0B" : score >= 4 ? "#22D3EE" : "#22D3A0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 72, height: 4, background: T.bg3, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${(score / 10) * 100}%`, height: "100%", background: c, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color: c }}>{score.toFixed(1)}</span>
    </div>
  );
};
