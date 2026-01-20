"use client";

import { useState } from "react";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // ✅ SINGLE SOURCE OF TRUTH
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume PDF");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);

    try {
      console.log("Using API_BASE:", API_BASE);

      const response = await fetch(
        `${API_BASE}/upload-resume/v2`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <h2>Resume PDF</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <h2 style={{ marginTop: "20px" }}>Target Role</h2>
      <input
        type="text"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 18px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume (V2)"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>ATS Score</h3>
          <p>{result.ats_score}/100</p>

          <h3>Role Match Score</h3>
          <p>{result.role_match_score}/100</p>

          <h3>Detected Skills</h3>
          <ul>
            {result.detected_skills?.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <details style={{ marginTop: "20px" }}>
            <summary>Debug JSON</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}





