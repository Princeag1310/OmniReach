import express from "express";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, firstName, lastName, tags } = req.body;
    const existing = await Contact.findOne({ userId: req.user.id, email });
    if (existing) {
      return res.status(400).json({ error: "Contact with this email already exists" });
    }
    const contact = new Contact({
      userId: req.user.id,
      email,
      firstName,
      lastName,
      tags: tags || []
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to create contact" });
  }
});

export default router;
