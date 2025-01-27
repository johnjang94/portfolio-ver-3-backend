const express = require("express");
const { chat } = require("../controllers/chatbot");
const router = express.Router();

router.post("/", chat);

module.exports = router;
