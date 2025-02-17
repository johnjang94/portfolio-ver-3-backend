const express = require("express");
const multer = require("multer");
const { sendEmail } = require("../controllers/email");
const validateInput = require("../middleware/validate-input");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("attachment"), validateInput, sendEmail);

module.exports = router;
