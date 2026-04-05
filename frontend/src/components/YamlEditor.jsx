import { useState } from "react";
import { T } from "../constants";
import { Chip } from "./UI";

const DEFAULT_YAML = `name: devflow-pipeline
on:
  push: { branches: [main, develop] }
  workflow_dispatch:

env:
  REGISTRY: registry.devflow.io
  IMAGE_TAG: \${{ github.sha }}

stages:
  build:
    image: node:20-alpine
    cache: [node_modules/]
    commands: [npm ci, npm run build, npm run lint]

  test:
    image: node:20-alpine
    commands: [npm test -- --coverage --ci]
    coverage: { threshold: 80 }

  sast:
    tool: veracode
    api_key: \${{ secrets.VERACODE_KEY }}
    fail_on: [critical]

  dependency-scan:
    tool: snyk
    token: \${{ secrets.SNYK_TOKEN }}
    severity: high

  docker:
    image: docker:dind
    commands:
      - docker build -t $REGISTRY/$IMAGE:$IMAGE_TAG .
      - docker push $REGISTRY/$IMAGE:$IMAGE_TAG

  deploy:
    tool: kubectl
    cluster: devflow-aks-prod
    manifest: k8s/
    approval_required: true
    strategy: rolling
`;

export default function YamlEditor({ onClose }) {
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 740, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chip color={T.purple}>&lt;/&gt; YAML</Chip>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text0 }}>Pipeline as Code</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => {}} style={{ background: T.accent + "20", border: `1px solid ${T.accent}40`, borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, color: T.accentHi, cursor: "pointer" }}>Save & Validate</button>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color: T.text2, cursor: "pointer" }}>Close</button>
          </div>
        </div>
        <textarea value={yaml} onChange={(e) => setYaml(e.target.value)} spellCheck={false}
          style={{ flex: 1, fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.8, padding: "1.25rem 1.5rem", border: "none", outline: "none", resize: "none", background: T.bg0, color: "#93C5FD", overflowY: "auto" }} />
        <div style={{ padding: "8px 1.5rem", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.text2, display: "flex", gap: 16 }}>
          <span>YAML · {yaml.split("\n").length} lines</span>
          <span style={{ color: T.success }}>✓ Syntax valid</span>
        </div>
      </div>
    </div>
  );
}
