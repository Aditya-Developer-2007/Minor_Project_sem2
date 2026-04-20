const express = require('express');
const router = express.Router();
const multer = require('multer');
const { summarizeJudgment, searchPrecedents, mapLaw } = require('../controllers/toolController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/summarize', protect, upload.single('pdf'), summarizeJudgment);
router.post('/search', protect, searchPrecedents);
router.post('/map', protect, mapLaw);

module.exports = router;
