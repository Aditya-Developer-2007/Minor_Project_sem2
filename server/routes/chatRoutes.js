const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createSession, getSessions, sendMessage, uploadPDF, deleteSession, togglePinSession } = require('../controllers/chatController');
const ChatData = require('../models/Chat');
const MockDB = require('../utils/mockDb');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const getChatModel = () => global.isMockDB ? MockDB.Chat : ChatData;

router.get('/', protect, getSessions);
router.post('/', protect, createSession);
router.post('/message', protect, sendMessage);
router.post('/upload', protect, upload.single('pdf'), uploadPDF);
router.delete('/:id', protect, deleteSession);
router.patch('/:id/pin', protect, togglePinSession);

// Hard-wired Save Brief Endpoint (Bypassing potential controller export issues)
router.post('/save-brief', protect, async (req, res) => {
  const { summary, fileName } = req.body;
  try {
    const Chat = getChatModel();
    const formattedContent = JSON.stringify({
      normal: summary,
      professional: `### Comprehensive Case Brief\n\n${summary}`,
      suggested_sections: []
    });

    const chat = await Chat.create({
      user: req.user._id,
      title: fileName ? `Brief: ${fileName}` : "Legal Brief",
      messages: [{ role: 'assistant', content: formattedContent }]
    });

    console.log(`✅ Brief saved successfully: ${chat._id}`);
    res.status(201).json(chat);
  } catch (error) {
    console.error("❌ Save Brief Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
