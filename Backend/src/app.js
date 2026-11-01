const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

// Diary jahan saare links save honge
const links = [];

// Random code banane ka function
function generateCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

// Step 2 + 3: Naya short link banao
app.post("/api/shorten", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ message: "Your URL is not valid" });
  }

  // Unique code banao
  let code = generateCode();
  while (links.find((link) => link.code === code)) {
    code = generateCode();
  }

  const newLink = {
    code,
    originalUrl: url,
    clicks: 0,
    createdAt: new Date(),
  };

  links.push(newLink);

  res.status(201).json({
    shortUrl: `http://localhost:3000/${code}`,
    code,
  });
});

// Step 4: Short code se asli URL pe redirect
app.get("/:code", (req, res) => {
  const { code } = req.params;

  const link = links.find((item) => item.code === code);

  if (!link) {
    return res.status(404).json({ message: "Short link not found" });
  }

  link.clicks++;
  res.redirect(link.originalUrl);
});




app.post("/api/ai-link-info", async (req, res) => {
  try {
    const { url, context } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required"
      });
    }

    const response = await fetch(
      "http://127.0.0.1:8000/ai-link-info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          context: context || ""
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("AI service error:", error.message);

    return res.status(502).json({
      message: "Could not connect to AI service"
    });
  }
});




module.exports=app;