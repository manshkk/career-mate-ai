"use client";

import { useState } from "react";

/* ================================
   CONFIG
================================ */
const API_BASE_URL = "http://127.0.0.1:8000";

/* ================================
   PROGRESS BAR COMPONENT
================================ */
function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div style={{ background: "#222", borderRadius: 8, height: 10 }}>
      <div
        style={{
          width: `${safe}%`,
          height: 10,
          borderRadius: 8,
          background: "linear-gradient(90deg, #4ade80, #22c55e)",
          transition: "width 300ms ease",
        }}
      />
    </div>
  );
}

/* ================================
   MAIN COMPONENT
================================ */
export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("Data Analyst");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", role);

    try {
      const res = await fetch(`${API_BASE_URL}/upload-resume/v2`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 30,
        color: "white",
      }}
    >
      {/* HEADER */}
      <h1 style={{ marginBottom: 6 }}>
        Career Mate AI — Resume Scoring (V2)
      </h1>
      <p style={{ color: "#aaa", marginTop: 0 }}>
        Upload a resume PDF → get ATS score, role match & skills
      </p>

      {/* INPUT SECTION */}
      <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Resume PDF</label>
          <br />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            {file ? `Selected: ${file.name}` : "No file selected"}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>Target Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Data Analyst"
            style={{
              width: "100%",
              maxWidth: 420,
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "white",
            }}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            width: 240,
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid #444",
            background: loading ? "#333" : "#111",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Analyzing..." : "Analyze Resume (V2)"}
        </button>

        {error && (
          <div
            style={{
              background: "#2a0000",
              border: "1px solid #ff4d4d",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <b>Error:</b> {error}
          </div>
        )}
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div style={{ marginTop: 40, display: "grid", gap: 24 }}>
          {/* SCORE CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "#111",
                padding: 24,
                borderRadius: 16,
              }}
            >
              <h3>ATS Score</h3>
              <h1>{result.ats_score}/100</h1>
              <ProgressBar value={result.ats_score} />
            </div>

            <div
              style={{
                background: "#111",
                padding: 24,
                borderRadius: 16,
              }}
            >
              <h3>Role Match Score</h3>
              <h1>{result.role_match_score}/100</h1>
              <ProgressBar value={result.role_match_score} />
            </div>
          </div>

          {/* SKILLS */}
          <div
            style={{
              background: "#111",
              padding: 24,
              borderRadius: 16,
            }}
          >
            <h3>Detected Skills</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 10,
              }}
            >
              {result.detected_skills?.map((skill: string) => (
                <span
                  key={skill}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "#222",
                    fontSize: 13,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* DEBUG JSON */}
          <details>
            <summary style={{ cursor: "pointer", color: "#aaa" }}>
              Debug JSON
            </summary>
            <pre
              style={{
                marginTop: 10,
                background: "#0a0a0a",
                padding: 16,
                borderRadius: 12,
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}


