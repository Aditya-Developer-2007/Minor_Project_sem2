const OpenAI = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Load Dataset
const dataPath = path.join(__dirname, '../data/legal_data.json');
let legalData = { precedents: [], bns_mappings: [], glossary: [] };
try {
  legalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) { console.error("Could not load legal_data.json"); }

const getOpenAI = () => new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1", 
});

const summarizeJudgment = async (req, res) => {
  console.log("Summarize Request Received:", { 
    bodyKeys: Object.keys(req.body), 
    hasFile: !!req.file,
    fileField: req.file?.fieldname 
  });
  try {
    let textToSummarize = req.body.text;

    // Handle PDF File Upload
    if (req.file) {
      console.log("Extracting PDF text...");
      const data = await pdf(req.file.buffer);
      textToSummarize = data.text;
      console.log("PDF Extraction Complete. Length:", textToSummarize?.length || 0);
    }

    if (!textToSummarize || textToSummarize.trim().length < 10) {
      console.log("Summarization aborted: Insufficient text length.");
      return res.status(400).json({ message: "Provided judgment text is too short or invalid" });
    }

    const openai = getOpenAI();
    const prompt = `Summarize this legal judgment into exactly 5 bullet points in Roman Hinglish. 
    Include the core facts and the 'Ratio Decidendi'. 
    Use a professional yet accessible Hinglish tone.
    
    Text: ${textToSummarize.substring(0, 6000)}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    console.error("Summarization Error:", error);
    res.status(500).json({ message: "Summarization failed" });
  }
};

const searchPrecedents = async (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ results: [] });

  try {
    const searchTerm = query.toLowerCase();
    
    // Live Search Logic: Filter through synthesized dataset
    const results = legalData.precedents.filter(p => 
      p.title.toLowerCase().includes(searchTerm) || 
      p.keywords.some(k => k.toLowerCase().includes(searchTerm)) ||
      p.professional_analysis.toLowerCase().includes(searchTerm)
    ).map(p => ({
        ...p,
        // Add a "matchType" or score if needed
        relevance: 100 
    }));

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

const mapLaw = async (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ matches: [] });

  try {
    const searchTerm = query.toLowerCase();
    
    // Find matching sections in the dataset
    const matches = legalData.bns_mappings.filter(m => 
      m.ipc.includes(searchTerm) || 
      m.bns.includes(searchTerm) || 
      m.offense.toLowerCase().includes(searchTerm)
    );

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: "Mapping failed" });
  }
};

module.exports = { summarizeJudgment, searchPrecedents, mapLaw };
