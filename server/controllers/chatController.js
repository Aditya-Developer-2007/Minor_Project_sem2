const ChatData = require('../models/Chat');
const MockDB = require('../utils/mockDb');
const OpenAI = require('openai');
const pdf = require('pdf-parse'); 
const fs = require('fs');
const path = require('path');

const getChatModel = () => global.isMockDB ? MockDB.Chat : ChatData;

const dataPath = path.join(__dirname, '../data/legal_data.json');
let legalData = { precedents: [], bns_mappings: [], glossary: [] };
try {
  legalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) { console.error("Could not load legal_data.json"); }

// Initialize Groq/OpenAI client once
const openai = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1", 
});

// UNIVERSAL HINGLISH PROMPT (VERSION 5.2 - DYNAMIC LANGUAGE)
const SYSTEM_PROMPT = `
Tumhara naam NYAI hai, ek smart Indian Legal Assistant. 

LANGUAGE POLICY:
1. DEFAULT: Hamesha Hinglish (Roman Hindi + English) ka use karein.
2. DYNAMIC SWITCH: Agar user kahe "English mein batao" ya "Hindi mein likho", tabhi us specific language mein answer dein.
3. STRUCTURE: Hamesha Dual-View JSON output dein (normal aur professional).

STRICT JSON OUTPUT FORMAT:
{
  "normal": "Simple explanation here...",
  "professional": "Detailed legal analysis here...",
  "suggested_sections": ["BNS 101", "IPC 302"]
}

IMPORTANT: Provide ONLY the JSON. No conversational filler outside the JSON.
`;

const contextSearch = (query) => {
    const term = query.toLowerCase();
    const matches = [];
    
    // Improved Keyword Matching with Weighting
    legalData.bns_mappings.forEach(m => {
        let weight = 0;
        if (term.includes(m.bns.toLowerCase())) weight += 3;
        if (term.includes(m.ipc.toLowerCase())) weight += 2;
        if (m.offense.toLowerCase().split(' ').some(word => term.includes(word))) weight += 1;
        
        if (weight > 0) {
            matches.push({ text: `IPC ${m.ipc} -> BNS ${m.bns} (${m.offense}). Change: ${m.change}`, weight });
        }
    });

    legalData.precedents.forEach(p => {
        let weight = 0;
        if (p.title.toLowerCase().includes(term)) weight += 3;
        if (p.keywords.some(k => term.includes(k.toLowerCase()))) weight += 2;
        if (p.professional_analysis.toLowerCase().includes(term)) weight += 1;

        if (weight > 0) {
            matches.push({ text: `PRECEDENT: ${p.title}. Ratio: ${p.professional_analysis}`, weight });
        }
    });

    // Sort by weight and pick top 5
    return matches.sort((a, b) => b.weight - a.weight).slice(0, 5).map(m => m.text).join("\n");
};

const createSession = async (req, res) => {
  try {
    const Chat = getChatModel();
    const chat = await Chat.create({ user: req.user._id, messages: [] });
    res.status(201).json(chat);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getSessions = async (req, res) => {
  try {
    const Chat = getChatModel();
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const sendMessage = async (req, res) => {
  const { chatId, content, stream = false } = req.body;

  try {

    const chat = await getChatModel().findOne({ _id: chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Step 1: Context Retrieval (RAG-lite)
    const context = contextSearch(content);
    
    chat.messages.push({ role: 'user', content });

    if (!stream) {
        // Non-streaming logic (legacy support)
        const completion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "system", content: `GROUND TRUTH CONTEXT:\n${context || "No specific matches found."}` },
                ...chat.messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.1, 
        });

        const aiResponse = completion.choices[0].message.content;
        chat.messages.push({ role: 'assistant', content: aiResponse });
        await chat.save();
        return res.json(chat);
    }

    // Streaming Logic (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completionStream = await openai.chat.completions.create({
      model: "llama-3.3-70b-specdec", // More stable than versatile for high-throughput
      response_format: { type: "json_object" },

      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `GROUND TRUTH CONTEXT:\n${context || "No specific matches found."}` },
        ...chat.messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.1,
      stream: true
    });

    let fullResponse = "";
    for await (const chunk of completionStream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    chat.messages.push({ role: 'assistant', content: fullResponse });

    // Title Generation (Background)
    if (chat.messages.length <= 2) {
       try {
         const titleGen = await openai.chat.completions.create({
           model: "llama-3.1-8b-instant",
           messages: [{ role: "user", content: `Generate a 3-5 word Hinglish title for: ${content}` }]
         });
         chat.title = titleGen.choices[0].message.content.replace(/"/g, '').trim();
       } catch (e) { console.log("Title generation failed"); }
    }

    await chat.save();
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("❌ AI SERVICE ERROR:", {
        message: error.message,
        stack: error.stack,
        chatId,
        user: req.user?._id
    });

    if (!res.headersSent) {
        // Send a more descriptive error message to the frontend
        const errorMsg = error.message?.includes("rate limit") ? "AI Rate Limit Reached" : "AI Service Temporarily Unavailable";
        res.status(500).json({ message: errorMsg, details: error.message });
    } else {
        res.write(`data: ${JSON.stringify({ error: "Stream Interrupted", details: error.message })}\n\n`);
        res.end();
    }
  }
};


const uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const data = await pdf(req.file.buffer);
    res.json({ text: data.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const Chat = getChatModel();
    let chat;
    if (global.isMockDB) {
      chat = await Chat.findByIdAndDelete(req.params.id);
    } else {
      chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const togglePinSession = async (req, res) => {
  try {
    const Chat = getChatModel();
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const isPinned = !chat.isPinned;
    if (global.isMockDB) {
      await Chat.findByIdAndUpdate(req.params.id, { isPinned });
    } else {
      chat.isPinned = isPinned;
      await chat.save();
    }
    const updatedChat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    res.json(updatedChat);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const saveBriefAsChat = async (req, res) => {
  const { summary, fileName } = req.body;
  try {
    const Chat = getChatModel();
    // Wrap summary in the standard JSON format so ChatWindow can render it
    const formattedContent = JSON.stringify({
      normal: summary,
      professional: `### Comprehensive Legal Brief\n\n${summary}`,
      suggested_sections: []
    });

    const chat = await Chat.create({
      user: req.user._id,
      title: fileName ? `Brief: ${fileName}` : "Legal Brief",
      messages: [
        { role: 'assistant', content: formattedContent }
      ]
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSession, getSessions, sendMessage, uploadPDF, deleteSession, togglePinSession, saveBriefAsChat };
