import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      // Mock for development if they don't have an API key yet
      return res.json({ 
        subject: "Welcome to OmniReach!",
        content: "<p>Hello there,</p><p>This is an AI-generated draft mock because no API key was provided. Replace GEMINI_API_KEY in the `.env` to make this live.</p><p>Best,</p><br/>Your Team" 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const aiPrompt = `You are an expert marketing copywriter. Write a professional, high-converting email based on the following intent. Return JSON ONLY with no markdown wrapping, structured like this: {"subject": "...", "content": "<p>HTML formatted body...</p>"}\nIntent: ${prompt}`;
    
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "");
    
    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
});

export default router;
