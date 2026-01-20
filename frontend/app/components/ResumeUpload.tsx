"use client";

import { useMemo, useState } from "react";

type ApiResponse = {
  ats_score?: number;
  role_match_score?: number;
  detected_skills?: string[];
  [key: string]: any;
};

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<string>("Data Analyst");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  // ✅ HARD fallback so Vercel build never fails
  // Even if env var is missing, app still works.
  const apiBaseUrl = useMemo(() => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const fallback = "https://career-mate-ai.onrender.com";
    const chosen = (envUrl && envUrl.trim()) ? envUrl.trim() : fallback;

    // Remove trailing slash if present
    return chosen.endsWith("/") ? chosen.slice(0, -1) : chosen;
  }, []);

  async function onAnalyze() {
    setError(null);
    setData(null);

    if (!file) {
      setError("Please choose a resume PDF first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_role", role);

      const res = await fetch(`${apiBaseUrl}/upload-resume/v2`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}. ${text ? `Details: ${text}` : ""}`.trim());
      }

      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  const ats = data?.ats_score ?? null;
  const match = data?.role_match_score ?? null;
  const skills = data?.detected_skills ?? [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 44, marginBottom: 10 }}>Career Mate AI — Resume Scoring (V2)</h1>
      <p style={{ color: "#bbb", marginTop: 0 }}>
        Upload a resume PDF → get ATS score, role match & skills
      </p>

      <div style={{ marginTop: 28 }}>
        <label style={{ fontWeight: 700 }}>Resume PDF</label>
        <div style={{ marginTop: 8 }}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        {file && <div style={{ color: "#aaa", marginTop: 8 }}>Selected: {file.name}</div>}
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ fontWeight: 700 }}>Target Role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "#fff",
            outline: "none",
          }}
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={loading}
        style={{
          marginTop: 18,
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid #333",
          background: loading ? "#111" : "#0b0b0b",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          width: 260,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume (V2)"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 14,
            background: "#2a0000",
            border: "1px solid #6b0000",
            color: "#ffb3b3",
            fontWeight: 700,
          }}
        >
          Error: {error}
        </div>
      )}

      {(ats !== null || match !== null || skills.length > 0) && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <ScoreCard title="ATS Score" value={ats} />
            <ScoreCard title="Role Match Score" value={match} />
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 14,
              border: "1px solid #222",
              background: "#0b0b0b",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Detected Skills</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {skills.length === 0 ? (
                <span style={{ color: "#aaa" }}>No skills detected.</span>
              ) : (
                skills.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #2a2a2a",
                      background: "#111",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    {s}
                  </span>
                ))
              )}
            </div>

            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer", color: "#bbb" }}>Debug JSON</summary>
              <pre
                style={{
                  marginTop: 10,
                  background: "#050505",
                  border: "1px solid #222",
                  padding: 12,
                  borderRadius: 12,
                  overflowX: "auto",
                  color: "#cfcfcf",
                }}
              >
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>

            <div style={{ marginTop: 14, color: "#777", fontSize: 12 }}>
              API used: {apiBaseUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, value }: { title: string; value: number | null }) {
  const pct = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div
      style={{
        flex: "1 1 320px",
        padding: 18,
        borderRadius: 14,
        border: "1px solid #222",
        background: "#0b0b0b",
        minWidth: 320,
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ fontSize: 34, fontWeight: 900 }}>
        {typeof value === "number" ? `${value}/100` : "--/100"}
      </div>

      <div style={{ marginTop: 12, height: 10, background: "#1a1a1a", borderRadius: 999 }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#22c55e",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}







