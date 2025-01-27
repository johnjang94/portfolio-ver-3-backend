import express from "express";
import { sendEmail } from "../controllers/email.js";
import validateInput from "../middleware/validate-input.js";

const router = express.Router();

router.post("/", validateInput, sendEmail);

export default router;
