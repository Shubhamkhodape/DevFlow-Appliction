import { T, STAGE_DEFS } from "./constants";

// ── ID / time helpers ─────────────────────────────────────────────────────────
export const genId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
export const now = () => new Date().toISOString().replace("T", " ").substr(0, 19);

// ── Colour helpers ────────────────────────────────────────────────────────────
export const sevColor = (s) => ({ Critical: "#F05252", High: "#F59E0B", Medium: "#22D3EE", Low: "#22D3A0" }[s] || T.text2);
export const sevBg    = (s) => ({ Critical: T.dangerBg, High: T.warningBg, Medium: T.cyanBg, Low: T.successBg }[s] || T.bg2);
export const stColor  = (s) => ({ success: T.success, failed: T.danger, running: T.accent, pending: T.warning, skipped: T.text2 }[s] || T.text2);
export const stBg     = (s) => ({ success: T.successBg, failed: T.dangerBg, running: "#0D1E44", pending: T.warningBg, skipped: T.bg2 }[s] || T.bg2);

export const langColor = {
  "Node.js": "#68A063", Java: "#F89820", Python: "#3776AB",
  React: "#61DAFB", Go: "#00ADD8", Rust: "#CE422B", Kotlin: "#7F52FF",
};

// ── Log generation ────────────────────────────────────────────────────────────
export const genLogs = (stage, status, project) => {
  const p = project || "service";
  const L = {
    build: [
      `${now()} [INFO]  Starting build pipeline for ${p}`,
      `${now()} [INFO]  Installing dependencies via npm ci...`,
      `${now()} [INFO]  Running ESLint (0 errors, 2 warnings)`,
      `${now()} [INFO]  Compiling TypeScript sources...`,
      `${now()} [INFO]  Bundling with webpack 5 (code splitting enabled)`,
      status === "failed"
        ? `${now()} [ERROR] Build failed: Cannot resolve module '@company/shared-utils'`
        : `${now()} [SUCCESS] Build complete in 42s → dist/bundle.js (2.4 MB gzipped: 780 KB)`,
    ],
    test: [
      `${now()} [INFO]  Jest v29.7 — collecting tests...`,
      `${now()} [INFO]  Found 247 test suites across 18 modules`,
      `${now()} [PASS]  auth.test.js           12 tests  1.2s`,
      `${now()} [PASS]  api.routes.test.js     34 tests  3.4s`,
      `${now()} [PASS]  middleware.test.js      8 tests  0.8s`,
      status === "failed"
        ? `${now()} [FAIL]  user.service.test.js — AssertionError: expected 200, received 403`
        : `${now()} [SUCCESS] 247/247 passed | Coverage: 84.2% | Time: 18.6s`,
    ],
    sast: [
      `${now()} [INFO]  Veracode SAST engine v23.11 initializing...`,
      `${now()} [INFO]  Scanning 1,247 source files...`,
      `${now()} [INFO]  Running taint analysis & data-flow checks`,
      `${now()} [WARN]  CWE-89: SQL injection at UserController.java:142`,
      `${now()} [WARN]  CWE-79: XSS vector in profile.js:87`,
      status === "failed"
        ? `${now()} [CRITICAL] Policy violation: critical findings → pipeline halted`
        : `${now()} [SUCCESS] 0 critical · 2 high · 1 medium — gate PASSED`,
    ],
    depcheck: [
      `${now()} [INFO]  Snyk Open Source scan starting...`,
      `${now()} [INFO]  Resolving dependency tree (412 packages)`,
      `${now()} [INFO]  Fetching CVE database (updated 4h ago)`,
      status === "failed"
        ? `${now()} [CRITICAL] CVE-2021-44228 CVSS:10.0 — log4j@2.14.0 RCE via JNDI → halted`
        : `${now()} [SUCCESS] No critical issues | 1 high (auto-fix available) — gate PASSED`,
    ],
    docker: [
      `${now()} [INFO]  Docker BuildKit enabled`,
      `${now()} [INFO]  Step 1/10: FROM node:20-alpine`,
      `${now()} [INFO]  Step 5/10: RUN npm ci --production`,
      `${now()} [INFO]  Step 9/10: COPY --from=build /app/dist ./dist`,
      status === "failed"
        ? `${now()} [ERROR] failed to solve: disk quota exceeded (10 GB limit)`
        : `${now()} [SUCCESS] Image tagged: registry.devflow.io/${p}:v2.4.1 (142 MB)`,
    ],
    artifact: [
      `${now()} [INFO]  Connecting to JFrog Artifactory...`,
      `${now()} [INFO]  Authenticated via service token`,
      `${now()} [INFO]  Pushing image layers (142 MB)...`,
      `${now()} [INFO]  Generating SBOM (Software Bill of Materials)`,
      status === "failed"
        ? `${now()} [ERROR] Push failed: 401 Unauthorized — token expired`
        : `${now()} [SUCCESS] Pushed → registry.devflow.io/${p}:v2.4.1 sha256:8f3a9c2d`,
    ],
    deploy: [
      `${now()} [INFO]  Connecting to AKS cluster devflow-prod...`,
      `${now()} [INFO]  kubectl apply -f k8s/deployment.yaml`,
      `${now()} [INFO]  deployment.apps/${p} configured`,
      `${now()} [INFO]  Waiting for rollout (2/2 pods ready)...`,
      status === "failed"
        ? `${now()} [ERROR] Rollout failed: pods stuck in ImagePullBackOff`
        : `${now()} [SUCCESS] Deployment complete — 2/2 pods running | p99 latency: 42ms`,
    ],
  };
  return L[stage] || [`${now()} [INFO]  Running ${stage}...`];
};
