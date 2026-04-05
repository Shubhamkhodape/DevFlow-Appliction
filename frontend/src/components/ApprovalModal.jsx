import { T } from "../constants";

export default function ApprovalModal({ run, onApprove, onReject, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: T.bg2, border: `1px solid ${T.warning}50`, borderRadius: 16, padding: "2rem", width: 440 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: T.warningBg, border: `1px solid ${T.warning}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔐</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text0 }}>Approval required</div>
            <div style={{ fontSize: 12, color: T.text1, marginTop: 3 }}>Production deployment awaiting sign-off</div>
          </div>
        </div>
        <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Deploying</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text0, marginBottom: 4 }}>{run?.project}</div>
          <div style={{ fontSize: 12, color: T.text1 }}>Branch: {run?.branch} · Triggered by: {run?.triggeredBy || "system"}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onApprove} style={{ flex: 1, background: T.successBg, border: `1px solid ${T.success}50`, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 800, color: T.success, cursor: "pointer" }}>Approve & Deploy</button>
          <button onClick={onReject}  style={{ flex: 1, background: T.dangerBg,  border: `1px solid ${T.danger}50`,  borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 800, color: T.danger,  cursor: "pointer" }}>Reject</button>
          <button onClick={onClose}   style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T.text2, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
