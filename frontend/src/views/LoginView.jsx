import { useState } from "react";
import { T, USERS_DB } from "../constants";

export default function LoginView({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    const user = USERS_DB.find((x) => x.username === u && x.password === p);
    user ? onLogin(user) : setErr("Invalid credentials. Try admin/admin123");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 40% at 50% -5%, ${T.accent}14, transparent)`, pointerEvents: "none" }} />
      <div style={{ width: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: T.accent + "20", border: `1px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 1rem" }}>☸</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text0, margin: "0 0 6px", letterSpacing: "-1px" }}>DevFlow</h1>
          <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Enterprise CI/CD · DevSecOps Platform</p>
        </div>
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: "2rem" }}>
          {err && <div style={{ background: T.dangerBg, border: `1px solid ${T.danger}40`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: T.danger, marginBottom: 16 }}>{err}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Username", "text", u, setU, "admin"], ["Password", "password", p, setP, "••••••••"]].map(([l, type, val, set, ph]) => (
              <div key={l}>
                <label style={{ fontSize: 10, color: T.text2, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</label>
                <input type={type} value={val} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={ph}
                  style={{ width: "100%", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", color: T.text0, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <button onClick={go} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 4, letterSpacing: ".02em" }}>Sign in →</button>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: "1.25rem", paddingTop: "1rem", fontSize: 11, color: T.text2, textAlign: "center" }}>
            Demo: <span style={{ color: T.accentHi }}>admin / admin123</span> · <span style={{ color: T.success }}>dev / dev123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
