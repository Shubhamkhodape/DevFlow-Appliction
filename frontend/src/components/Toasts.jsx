import { T } from "../constants";

export default function Toasts({ items, onDismiss }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999, maxWidth: 360 }}>
      {items.map((t) => {
        const c = { success: T.success, error: T.danger, warning: T.warning, info: T.accent }[t.type] || T.accent;
        return (
          <div key={t.id} style={{ background: T.bg2, border: `1px solid ${c}50`, borderLeft: `3px solid ${c}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, color: c, marginTop: 1 }}>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "⚠"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text0, marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: T.text1 }}>{t.msg}</div>
            </div>
            <button onClick={() => onDismiss(t.id)} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
