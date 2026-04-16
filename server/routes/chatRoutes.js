

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createSession, getSessions, sendMessage, uploadPDF, deleteSession, togglePinSession } = require('../controllers/chatController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', protect, getSessions);

router.post('/', protect, createSession);

router.post('/message', protect, sendMessage);

router.post('/upload', protect, upload.single('pdf'), uploadPDF);

router.delete('/:id', protect, deleteSession);

router.patch('/:id/pin', protect, togglePinSession);

module.exports = router;
