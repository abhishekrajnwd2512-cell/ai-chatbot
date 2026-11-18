
import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    if (messages.length > 20) {
      return res.status(400).json({
        error: "Conversation is too long. Start a new chat."
      });
    }

    const validMessages = messages.every(
      message =>
        ["user", "model"].includes(message.role) &&
        typeof message.text === "string" &&
        message.text.length > 0 &&
        message.text.length <= 4000
    );

    if (!validMessages) {
      return res.status(400).json({
        error: "Invalid message format."
      });
    }

    const contents = messages.map(message => ({
      role: message.role,
      parts: [{ text: message.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
      config: {
        systemInstruction:
          "You are a helpful, friendly AI assistant. Give clear, useful answers. Format responses neatly."
      }
    });

    res.json({
      reply: response.text || "I couldn't generate a response."
    });

  } catch (error) {
    console.error("Gemini error:", error.message);

    res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

