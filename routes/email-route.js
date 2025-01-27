const express = require("express");
const { sendEmail } = require("../controllers/email");
const validateInput = require("../middleware/validate-input");
const router = express.Router();

router.post("/", validateInput, sendEmail);

module.exports = router;
