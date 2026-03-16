require('dotenv').config(); 
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse-fork');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Optimized CORS for Vercel
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json()); 

const upload = multer({ storage: multer.memoryStorage() });

if (!process.env.GROQ_API_KEY) {
    console.error("❌ ERROR: GROQ_API_KEY is missing!");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Health check route
app.get('/', (req, res) => res.send("ResumeIQ API is running..."));

app.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        let resumeText = "";
        try {
            const pdfData = await pdf(req.file.buffer);
            resumeText = pdfData.text.replace(/[^\x20-\x7E\n\t]/g, '').trim();
            
            if (!resumeText || resumeText.length < 20) {
                throw new Error("PDF content unreadable.");
            }
        } catch (pdfError) {
            return res.status(422).json({ error: "Failed to parse PDF." });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional Applicant Tracking System (ATS). You output high-quality, professional resume match data in JSON format."
                },
                {
                    role: "user",
                    content: `Analyze this resume relative to the following Job Description (JD).
                    
                    JD: "${jobDescription || 'Standard Professional Role'}"
                    RESUME: "${resumeText.substring(0, 8000)}"

                    CRITICAL INSTRUCTIONS FOR SCORING:
                    1. All scores MUST be WHOLE INTEGERS between 0 and 100.
                    2. Be realistic: A strong match should be between 80-98.
                    3. If the candidate has the required experience and skills, do not score them below 70.

                    Return ONLY this JSON structure:
                    {
                      "score": 92,
                      "sectionScores": { 
                        "technicalSkills": 95, 
                        "experience": 88, 
                        "education": 100, 
                        "formatting": 90 
                      },
                      "summary": "2-sentence professional overview.",
                      "missingKeywords": ["keyword1", "keyword2"],
                      "feedback": ["tip1", "tip2"]
                    }`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(chatCompletion.choices[0].message.content);
        
        // Auto-correction for decimal outputs
        if (result.score <= 1) {
            result.score = Math.round(result.score * 100);
            if (result.sectionScores) {
                Object.keys(result.sectionScores).forEach(key => {
                    if (result.sectionScores[key] <= 1) {
                        result.sectionScores[key] = Math.round(result.sectionScores[key] * 100);
                    }
                });
            }
        }

        res.json(result);

    } catch (error) {
        console.error("❌ Server Error:", error.message);
        res.status(500).json({ error: "Server failed to process analysis." });
    }
});

// --- VERCEL DEPLOYMENT FIX ---
// This ensures the app only 'listens' when running locally.
// Vercel handles the listener in production.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Local server spinning on port ${PORT}`);
    });
}

module.exports = app;