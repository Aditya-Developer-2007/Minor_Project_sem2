const ChatData = require('../models/Chat');
const MockDB = require('../utils/mockDb');

const getChatModel = () => global.isMockDB ? MockDB.Chat : ChatData;

const OpenAI = require('openai');
// 1. pdf-parse ko require kiya (Ensure: npm install pdf-parse)
const pdf = require('pdf-parse'); 

// UNIVERSAL HINGLISH PROMPT
const SYSTEM_PROMPT = `
Tumhara naam NYAI hai, ek smart Indian Legal Assistant. 
Tumhara kaam logo ki legal queries solve karna aur unhe kanoon samjhana hai professional manner mein.

LANGUAGE RULES:
1. DEFAULT LANGUAGE: ALWAYS talk in Hinglish (Hindi + English mix written in Roman script).
2. LANGUAGE SWITCH: Only switch to pure Hindi (Devanagari) or pure English if the user explicitly asks for it (e.g. "Talk in English" or "Hindi mein bolo"). Otherwise, stick to Hinglish.

STRICT FORMATTING RULES:
1. ALWAYS use double line breaks (\n\n) between every point, header, and paragraph.
2. Use Markdown: Use **Bold Headers** and Bullet Points (*) for lists.
3. Keep sentences concise and easy to understand.

RESPONSE STRUCTURE (PROPER MANNER):
- **Summary**: User ki situation ka short overview.
- **Legal Context**: Relevant Sections (BNS, IPC, Constitution) cite karo.
- **Action Steps**: User ke liye practical step-by-step guidance.
- **Dhyan Dein**: End mein likho "Main ek AI hoon, final advice ke liye ek qualified lawyer se milein."
`;

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
  const { chatId, content } = req.body;

  try {
    // 2. Initialization ko function ke andar rakha taaki credentials crash na ho
    const openai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY, 
      baseURL: "https://api.groq.com/openai/v1", 
    });

    const chat = await getChatModel().findOne({ _id: chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.push({ role: 'user', content });

    // AI Response with Llama 3.1
    const completion = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...chat.messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.1, 
    });

    const aiResponse = completion.choices[0].message.content;
    chat.messages.push({ role: 'assistant', content: aiResponse });

    // Title Generation for Sidebar
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
    res.json(chat);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "AI Service Error" });
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
    // Verify ownership before deleting
    let chat;
    if (global.isMockDB) {
      chat = await Chat.findByIdAndDelete(req.params.id);
    } else {
      chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    }
    
    if (!chat) return res.status(404).json({ message: "Chat not found or unauthorized" });
    res.json({ message: "Chat deleted successfully" });
  } catch (error) { 
    console.error("Delete Session Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};

const togglePinSession = async (req, res) => {
  try {
    const Chat = getChatModel();
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    
    // Support both Mongoose and MockDB
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

module.exports = { createSession, getSessions, sendMessage, uploadPDF, deleteSession, togglePinSession };
