import express from "express";
import Template from "../models/Template.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, subject, htmlContent } = req.body;
    const template = new Template({
      userId: req.user.id,
      name: name || "Untitled Template",
      subject,
      htmlContent
    });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: "Failed to create template" });
  }
});

export default router;
