// ── Theme tokens ──────────────────────────────────────────────────────────────
export const T = {
  bg0: "#060B18", bg1: "#0D1526", bg2: "#111D35", bg3: "#162240", bg4: "#1C2B4E",
  border: "#1E3058", borderHi: "#2A4070",
  accent: "#3B7BF6", accentHi: "#5B9BFF", accentGlow: "#3B7BF620",
  success: "#22D3A0", successBg: "#0A2C24",
  danger: "#F05252", dangerBg: "#2D0F0F",
  warning: "#F59E0B", warningBg: "#2D1F00",
  purple: "#A78BFA", purpleBg: "#1E1540",
  cyan: "#22D3EE", cyanBg: "#0A2535",
  text0: "#F0F6FF", text1: "#8BA3CC", text2: "#4D6490",
  mono: "'JetBrains Mono','Fira Code',monospace",
};

// ── Static user data (replace with API calls in production) ──────────────────
export const USERS_DB = [
  { id: 1, username: "admin", password: "admin123", role: "Admin",     email: "admin@devflow.io", avatar: "AD", color: T.accent },
  { id: 2, username: "dev",   password: "dev123",   role: "Developer", email: "dev@devflow.io",   avatar: "DV", color: T.success },
];

// ── Vulnerability pool for simulation ────────────────────────────────────────
export const VULN_POOL = {
  sast: [
    { id: "S001", title: "SQL Injection in UserController.java",    severity: "Critical", file: "src/UserController.java", line: 142, tool: "Veracode SAST", cvss: 9.8, cwe: "CWE-89",  fix: "Use parameterized queries or an ORM" },
    { id: "S002", title: "XSS via unescaped user input",           severity: "High",     file: "src/views/profile.js",    line: 87,  tool: "Veracode SAST", cvss: 7.4, cwe: "CWE-79",  fix: "Sanitize output with DOMPurify" },
    { id: "S003", title: "Hardcoded credentials in config",        severity: "High",     file: "src/config/db.js",        line: 12,  tool: "Veracode SAST", cvss: 7.5, cwe: "CWE-798", fix: "Move secrets to environment variables" },
    { id: "S004", title: "Insecure random number generator",       severity: "Medium",   file: "src/auth/token.js",       line: 34,  tool: "Veracode SAST", cvss: 5.3, cwe: "CWE-338", fix: "Use crypto.randomBytes()" },
    { id: "S005", title: "Missing input validation on search API", severity: "Low",      file: "src/api/search.js",       line: 56,  tool: "Veracode SAST", cvss: 3.1, cwe: "CWE-20",  fix: "Add Joi or Zod schema validation" },
  ],
  deps: [
    { id: "D001", title: "lodash — Prototype Pollution",   severity: "Critical", pkg: "lodash@4.17.15",  fix: "lodash@4.17.21",  tool: "Snyk", cvss: 9.1,  cve: "CVE-2020-8203" },
    { id: "D002", title: "axios — SSRF Vulnerability",     severity: "High",     pkg: "axios@0.21.0",    fix: "axios@0.21.4",    tool: "Snyk", cvss: 7.7,  cve: "CVE-2021-3749" },
    { id: "D003", title: "log4j — Log4Shell RCE",          severity: "Critical", pkg: "log4j@2.14.0",    fix: "log4j@2.17.0",    tool: "Snyk", cvss: 10.0, cve: "CVE-2021-44228" },
    { id: "D004", title: "minimist — Prototype Pollution", severity: "Medium",   pkg: "minimist@1.2.5",  fix: "minimist@1.2.6",  tool: "Snyk", cvss: 5.6,  cve: "CVE-2021-44906" },
    { id: "D005", title: "node-fetch — Open Redirect",     severity: "Low",      pkg: "node-fetch@2.6.0", fix: "node-fetch@2.6.7", tool: "Snyk", cvss: 2.6, cve: "CVE-2022-0235" },
  ],
};

// ── Pipeline stage definitions ────────────────────────────────────────────────
export const STAGE_DEFS = [
  { id: "build",    label: "Build",       icon: "⚙",  color: "#3B7BF6", bg: "#0D1E44", desc: "Compile & bundle source" },
  { id: "test",     label: "Test",        icon: "✓",  color: "#A78BFA", bg: "#1E1540", desc: "Unit & integration tests" },
  { id: "sast",     label: "SAST",        icon: "⚠",  color: "#F59E0B", bg: "#2D1F00", desc: "Veracode static analysis" },
  { id: "depcheck", label: "Dep Scan",    icon: "◎",  color: "#F05252", bg: "#2D0F0F", desc: "Snyk dependency audit" },
  { id: "docker",   label: "Docker",      icon: "◼",  color: "#22D3EE", bg: "#0A2535", desc: "Build container image" },
  { id: "artifact", label: "Artifactory", icon: "▲",  color: "#22D3A0", bg: "#0A2C24", desc: "Push to JFrog" },
  { id: "deploy",   label: "K8s Deploy",  icon: "☸",  color: "#818CF8", bg: "#1A1A40", desc: "Roll out to Kubernetes" },
];

// ── Sample project definitions ────────────────────────────────────────────────
export const SAMPLE_PROJECTS = [
  { id: 1, name: "api-gateway",   repo: "github.com/devflow/api-gateway",   branch: "main",            lang: "Node.js", description: "Core API gateway & reverse proxy",    stages: ["build","test","sast","depcheck","docker","artifact","deploy"], status: "success", env: "production" },
  { id: 2, name: "auth-service",  repo: "github.com/devflow/auth-service",  branch: "develop",         lang: "Java",    description: "OAuth2 authentication microservice",  stages: ["build","test","sast","depcheck","docker","deploy"],            status: "failed",  env: "staging" },
  { id: 3, name: "frontend-app",  repo: "github.com/devflow/frontend-app",  branch: "feature/dash-v2", lang: "React",   description: "Customer-facing web application",     stages: ["build","test","depcheck","docker","artifact"],                 status: "running", env: "staging" },
  { id: 4, name: "data-pipeline", repo: "github.com/devflow/data-pipeline", branch: "main",            lang: "Python",  description: "ETL pipeline & analytics processor",  stages: ["build","test","sast","docker","deploy"],                       status: "success", env: "production" },
];

// ── Static artifact registry data ────────────────────────────────────────────
export const ARTIFACTS_DATA = [
  { id: 1, name: "api-gateway",   version: "v2.4.1", type: "docker", size: "142 MB", pushed: "2m ago",  digest: "sha256:8f3a9c2d", project: "api-gateway" },
  { id: 2, name: "api-gateway",   version: "v2.4.0", type: "docker", size: "138 MB", pushed: "3h ago",  digest: "sha256:7e2b4f1a", project: "api-gateway" },
  { id: 3, name: "auth-service",  version: "v1.9.2", type: "jar",    size: "24 MB",  pushed: "1d ago",  digest: "sha256:5d1c8e3b", project: "auth-service" },
  { id: 4, name: "frontend-app",  version: "v3.1.0", type: "docker", size: "89 MB",  pushed: "1h ago",  digest: "sha256:9a4f2c7e", project: "frontend-app" },
  { id: 5, name: "data-pipeline", version: "v1.2.0", type: "docker", size: "210 MB", pushed: "4h ago",  digest: "sha256:3b9d1f4c", project: "data-pipeline" },
];

// ── Kubernetes pod data ───────────────────────────────────────────────────────
export const K8S_PODS = [
  { name: "api-gateway-7d9f-xkq2p",   status: "Running",          ready: "1/1", restarts: 0, age: "2m",  node: "node-01", cpu: "12m",  mem: "128Mi" },
  { name: "api-gateway-7d9f-m8pl3",   status: "Running",          ready: "1/1", restarts: 0, age: "2m",  node: "node-02", cpu: "10m",  mem: "120Mi" },
  { name: "auth-service-5c8b-qr9wx",  status: "CrashLoopBackOff", ready: "0/1", restarts: 7, age: "15m", node: "node-01", cpu: "0m",   mem: "0Mi" },
  { name: "frontend-6f4d-jvk5n",      status: "Running",          ready: "1/1", restarts: 0, age: "1h",  node: "node-03", cpu: "5m",   mem: "64Mi" },
  { name: "data-pipeline-9c2a-wrp7k", status: "Running",          ready: "1/1", restarts: 0, age: "4h",  node: "node-02", cpu: "280m", mem: "512Mi" },
  { name: "postgres-0",               status: "Running",          ready: "1/1", restarts: 0, age: "7d",  node: "node-01", cpu: "45m",  mem: "256Mi" },
  { name: "redis-master-0",           status: "Running",          ready: "1/1", restarts: 0, age: "7d",  node: "node-03", cpu: "8m",   mem: "96Mi" },
];

// ── Navigation config ─────────────────────────────────────────────────────────
export const NAV = [
  { id: "dashboard",     label: "Dashboard",     icon: "⊞" },
  { id: "projects",      label: "Projects",      icon: "◈" },
  { id: "pipelines",     label: "Pipelines",     icon: "⟶" },
  { id: "security",      label: "Security",      icon: "⚠" },
  { id: "artifacts",     label: "Artifacts",     icon: "▲" },
  { id: "kubernetes",    label: "Kubernetes",    icon: "☸" },
  { id: "observability", label: "Observability", icon: "◉" },
];
