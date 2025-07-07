import { useState } from 'react';
import Head from 'next/head';

const API_BASE = "https://shadowsnitch-x.onrender.com"; // ✅ Your live backend URL

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState(null);
  const [view, setView] = useState('scan');

  const analyzeLink = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setResult(data);
      setCrawlResult(null);
    } catch (err) {
      alert("Error analyzing link.");
    }
    setLoading(false);
  };

  const crawlDarkWeb = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crawl-darkweb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setCrawlResult(data);
    } catch (err) {
      alert("Dark web crawl failed.");
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recent-scans`);
      const data = await res.json();
      setHistory(data.reverse());
    } catch (err) {
      alert("Could not load history.");
    }
    setLoading(false);
  };

  const ResultCard = ({ scan }) => (
    <div className="result-card">
      <p><strong>Original URL:</strong> {scan.original_url}</p>
      <p><strong>Final Destination:</strong> {scan.final_destination}</p>
      <p><strong>Phishing Score:</strong> {scan.phishing_score}</p>
      <p><strong>Threat Tags:</strong> {scan.threat_tags.join(', ') || 'None'}</p>
      <p><strong>Blacklist:</strong> {scan.blacklist_status}</p>
      <p><strong>Clone Detected:</strong> {scan.is_clone ? 'Yes' : 'No'}</p>
      <p><strong>WHOIS:</strong> {scan.domain_info?.registrar || 'N/A'}</p>
      <p><strong>Geo Info:</strong> {scan.geo_info?.ip} - {scan.geo_info?.country} ({scan.geo_info?.org})</p>
      <p><strong>Scan Time:</strong> {scan.timestamp}</p>
      <p><strong>Metadata:</strong> {scan.page_metadata?.title}</p>
    </div>
  );

  return (
    <div>
      <Head>
        <title>ShadowSnitch X 🕵️‍♂️</title>
      </Head>

      <main className="container">
        <h1>🔍 ShadowSnitch X</h1>

        <div className="tab-buttons">
          <button onClick={() => setView('scan')}>Scan Link</button>
          <button onClick={() => { setView('history'); fetchHistory(); }}>Public History</button>
        </div>

        {view === 'scan' && (
          <>
            <input
              type="text"
              placeholder="Paste suspicious URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={analyzeLink} disabled={loading}>⚡ Analyze</button>
            <button onClick={crawlDarkWeb} disabled={loading}>🌐 Crawl Dark Web</button>

            {loading && <p>Loading...</p>}

            {result && (
              <div className="result-box">
                <h3>🎯 Scan Result</h3>
                <p><strong>Original URL:</strong> {result.original_url}</p>
                <p><strong>Final Destination:</strong> {result.final_destination}</p>
                <p><strong>Redirect Chain:</strong> {result.redirect_chain.join(" → ")}</p>
                <p><strong>Phishing Score:</strong> {result.phishing_score}</p>
                <p><strong>Threat Tags:</strong> {result.threat_tags.join(', ') || 'None'}</p>
                <p><strong>Blacklist Status:</strong> {result.blacklist_status}</p>
                <p><strong>Clone Detected:</strong> {result.is_clone ? "Yes" : "No"}</p>
                <p><strong>WHOIS:</strong> {result.domain_info?.registrar || 'N/A'}</p>
                <p><strong>Geo Info:</strong> {result.geo_info?.ip} - {result.geo_info?.country} ({result.geo_info?.org})</p>
                <p><strong>Metadata Title:</strong> {result.page_metadata?.title}</p>
                <details>
                  <summary><strong>Metadata Tags</strong></summary>
                  <ul>
                    {result.page_metadata?.meta &&
                      Object.entries(result.page_metadata.meta).map(([key, val], idx) => (
                        <li key={idx}><strong>{key}</strong>: {val}</li>
                      ))}
                  </ul>
                </details>
              </div>
            )}

            {crawlResult && (
              <div className="crawl-box">
                <h4>🕸️ Dark Web Result</h4>
                <p><strong>Onion Mirror:</strong> {crawlResult.onion_mirror}</p>
                <p><strong>Verified:</strong> {crawlResult.verified ? "Yes" : "No"}</p>
              </div>
            )}
          </>
        )}

        {view === 'history' && (
          <>
            <h3>📜 Public Scan History</h3>
            {loading ? <p>Loading history...</p> :
              history.length ? history.map((scan, idx) => (
                <ResultCard key={idx} scan={scan} />
              )) : <p>No scan history found.</p>}
          </>
        )}
      </main>

      <style jsx>{`
        .container {
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          background-color: #111;
          color: #eee;
          min-height: 100vh;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #0ff;
        }
        input {
          width: 100%;
          padding: 10px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        button {
          margin-right: 10px;
          padding: 10px 15px;
          font-weight: bold;
          background: #222;
          color: #0f0;
          border: 1px solid #0f0;
          cursor: pointer;
        }
        button:hover {
          background: #0f0;
          color: #000;
        }
        .result-box, .crawl-box, .result-card {
          background: #222;
          padding: 1rem;
          margin-top: 1rem;
          border-left: 4px solid #0ff;
        }
        .tab-buttons button {
          margin-bottom: 1rem;
        }
        summary {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
