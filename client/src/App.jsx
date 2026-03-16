import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Target, BarChart3 } from 'lucide-react';

// This logic automatically switches between your local server and your live production server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState(""); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setData(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    try {
      // API_BASE_URL handles the switch for deployment
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please ensure the server is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1e40af', fontSize: '2.8rem', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            ResumeIQ <Sparkles size={32} color="#fbbf24" fill="#fbbf24"/>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Optimize your resume for specific job descriptions using Llama 3 AI.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Section 1: Job Description */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
              <Target size={20} color="#2563eb"/> Job Description
            </h3>
            <textarea 
              placeholder="Paste the target job description here for better matching..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              style={{ width: '100%', height: '150px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'none', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          {/* Section 2: File Upload */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
              <FileText size={20} color="#2563eb"/> Resume (PDF)
            </h3>
            <div style={{ flex: 1, border: '2px dashed #e5e7eb', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative' }}>
              <Upload size={32} color="#9ca3af" style={{ marginBottom: '10px' }} />
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
              />
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Click or drag PDF here</p>
              {file && <p style={{ marginTop: '10px', color: '#2563eb', fontWeight: 'bold' }}>✓ {file.name}</p>}
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          style={{ 
            width: '100%', padding: '16px', backgroundColor: file && !loading ? '#2563eb' : '#9ca3af', 
            color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
            transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={20} className="animate-spin" /> Analyzing...
            </span>
          ) : "Generate AI Match Report"}
        </button>

        {/* Results Section */}
        {data && (
          <div style={{ marginTop: '40px', display: 'grid', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Overall Match</p>
                <h2 style={{ fontSize: '3.5rem', margin: '10px 0', color: '#2563eb' }}>{data.score}%</h2>
                <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                  <div style={{ width: `${data.score}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '4px', transition: 'width 1s ease' }}></div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18}/> Category Breakdown</h4>
                {Object.entries(data.sectionScores).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ fontWeight: 'bold' }}>{val}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px' }}>
                      <div style={{ width: `${val}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px', transition: 'width 1s ease' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
              <p style={{ margin: 0, color: '#1e40af', fontStyle: 'italic' }}>"{data.summary}"</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}><AlertCircle size={20}/> Missing Keywords</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                  {data.missingKeywords.map((kw, i) => (
                    <span key={i} style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid #ffedd5' }}>{kw}</span>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}><CheckCircle size={20}/> Feedback</h3>
                <ul style={{ paddingLeft: '20px', marginTop: '15px', color: '#4b5563', fontSize: '0.95rem' }}>
                  {data.feedback.map((item, i) => <li key={i} style={{ marginBottom: '10px' }}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default App;