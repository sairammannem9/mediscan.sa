import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 5173;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Multer for image uploads (to memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basic health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Ask endpoint: text-only
app.post('/api/ask', async (req, res) => {
  try {
    const { prompt, gender='neutral' } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const system = `You are a friendly, safety-conscious health info assistant for a consumer website.
- You do not give diagnoses; you offer general education and self-care suggestions.
- If the situation sounds urgent, tell the user to seek professional medical care.
- Keep answers short and readable.
- If gender style is provided (${gender}), keep tone appropriate (but do not change medical facts).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a reply.";
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// Scan endpoint: image + mode
app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    const mode = (req.body?.mode || 'symptom').toLowerCase();
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const prompt = mode === 'medicine'
      ? "Identify the pill/medication in this image if possible, list common active ingredient(s), typical uses, and major safety warnings. If uncertain, say so. Do not provide dosages; recommend consulting a pharmacist/doctor."
      : "Describe visible skin/eye issues in this image in plain language, list common non-urgent possibilities, and give simple self-care ideas. If there are alarming signs (severe pain, spreading rapidly, high fever, eye involvement), advise urgent care.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a careful vision assistant for consumer health. Avoid diagnosis; give educational guidance and safety triage." },
        { role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } }
        ]}
      ],
      temperature: 0.3,
    });

    const text = response.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't analyze that image.";
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI vision request failed' });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(port, () => console.log(`SA Doctor Scan listening on http://localhost:${port}`));
