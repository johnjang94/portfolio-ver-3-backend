module.exports = (req, res, next) => {
  console.log("validateInput req.body:", req.body);
  const { name, email, Inquiry, Message } = req.body;

  if (req.body.warmUp) {
    return res
      .status(200)
      .json({ message: "SMTP connection warmed up, email not sent." });
  }

  if (!name || !email || !Inquiry || !Message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};
