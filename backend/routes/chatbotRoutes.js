const express = require('express');
const { chatbotReply } = require('../controllers/chatbotController');
const router = express.Router();

router.post('/', chatbotReply);

module.exports = router;
