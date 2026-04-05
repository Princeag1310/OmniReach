import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
router.use(requireAuth);

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Fallback if no API key
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        role: "model",
        parts: [{ text: "```json\n{\"subject\": \"Mock API Fallback\", \"content\": \"<p>Provide a valid GEMINI_API_KEY inside your backend .env!</p>\"}\n```" }]
      });
    }

    // Fetch user company profile
    const user = await User.findById(req.user.id);
    const companyContext = user.companyName ? `
    COMPANY PROFILE:
    - Name: ${user.companyName}
    - Industry: ${user.companyIndustry || "General"}
    - Brand Tone: ${user.brandTone || "Professional"}
    ` : "No specific company profile provided yet.";

    const systemInstruction = `
    You are an expert, conversational AI Email Marketing Co-Pilot. 
    You are working directly with the user to brainstorm and construct a high-converting HTML email.
    
    ${companyContext}
    
    RULES:
    1. If the user's initial prompt is vague, DO NOT generate the email immediately. ASk clarifying questions about their target audience, CTA, or intent.
    2. Maintain a friendly, consultative conversation.
    3. Once you determine you have enough information, generate the final email.
    4. WHEN you are ready to deliver the final email design, you MUST return it EXACTLY as a raw JSON payload (no Markdown, no surrounding conversational text in that final hop).
    5. The final JSON payload must strictly look like this: 
       {"subject": "A catchy subject line", "content": "<p>Full HTML layout covering everything discussed</p>"}
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction
    });

    const chat = model.startChat({
        history: history || [],
    });

    const result = await chat.sendMessage(message);
    const responseText = await result.response.text();

    res.json({
        role: "model",
        parts: [{ text: responseText }]
    });

  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: "Failed to process chat response" });
  }
});

export default router;
