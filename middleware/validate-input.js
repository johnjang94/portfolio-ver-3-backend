module.exports = (req, res, next) => {
  const { name, email, inquiry, message } = req.body;

  if (req.body.warmUp) {
    return res
      .status(200)
      .json({ message: "SMTP connection warmed up, email not sent." });
  }

  if (!name || !email || !inquiry || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};
