import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: '/tmp/uploads/' });

// Public Unsubscribe Endpoint (Must be before requireAuth)
router.get("/unsubscribe/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { unsubscribed: true });
    if (contact) {
      res.send(`<h1>Successfully Unsubscribed</h1><p>You will no longer receive emails at ${contact.email}.</p>`);
    } else {
      res.status(404).send("Contact not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

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

router.post("/bulk", upload.single("csvFile"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File required" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let createdCount = 0;
      for (const row of results) {
        if (!row.email) continue;
        const exists = await Contact.findOne({ userId: req.user.id, email: row.email });
        if (!exists) {
           await Contact.create({
             userId: req.user.id,
             email: row.email,
             firstName: row.firstName || row.first_name || '',
             lastName: row.lastName || row.last_name || '',
             tags: ["Bulk Imported"]
           });
           createdCount++;
        }
      }
      fs.unlinkSync(req.file.path);
      res.json({ message: `Successfully imported ${createdCount} new contacts.` });
    });
});

export default router;
