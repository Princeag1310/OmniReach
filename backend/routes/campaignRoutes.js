import express from "express";
import Campaign from "../models/Campaign.js";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../utils/awsSes.js";

const router = express.Router();

router.use(requireAuth);

router.post("/send", async (req, res) => {
  try {
    const { title, subject, content, targetTags, targetContacts, scheduledAt } = req.body;
    
    // Create Draft Campaign
    const campaign = new Campaign({
      userId: req.user.id,
      title,
      subject,
      content,
      senderName: "OmniReach Dashboard",
      senderEmail: process.env.AWS_SES_SENDER,
      status: scheduledAt ? "SCHEDULED" : "SENDING",
      scheduledAt: scheduledAt || null,
      targetTags: targetTags || [],
      targetContacts: targetContacts || []
    });
    await campaign.save();

    // Fetch Target Contacts
    let query = { userId: req.user.id, unsubscribed: false };
    if (targetContacts && targetContacts.length > 0) {
        query._id = { $in: targetContacts };
    } else if (targetTags && targetTags.length > 0) {
        query.tags = { $in: targetTags };
    }
    const contacts = await Contact.find(query);

    if (contacts.length === 0) {
      campaign.status = "FAILED";
      await campaign.save();
      return res.status(400).json({ error: "No active contacts found for this audience" });
    }

    if (scheduledAt) {
      return res.status(202).json({ message: "Campaign scheduled successfully!", campaignId: campaign._id, totalTarget: contacts.length });
    }

    res.status(202).json({ message: "Campaign dispatch started!", campaignId: campaign._id, totalTarget: contacts.length });

    // BACKGROUND PROCESS: Dispatching and Emitting WebSocket events
    const io = req.app.get("io");
    let sentCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      try {
        const c = contacts[i];
        
        // Wait 1 second between sends to respect Sandbox/general rate limits for the portfolio demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Personalize and Unsubscribe insertion
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const unsubLink = `${backendUrl}/api/contacts/unsubscribe/${c._id}`;
        let personalizedContent = content.replace(/{{firstName}}/g, c.firstName || "Friend");
        personalizedContent += `<br/><br/><p style="font-size: 11px; color: #888;">To stop receiving these emails, <a href="${unsubLink}">click here to unsubscribe</a>.</p>`;
        
        await sendEmail(c.email, subject, personalizedContent, process.env.AWS_SES_SENDER);
        
        sentCount++;
        io.emit(`campaignStatus:${campaign._id}`, {
          status: "SENDING",
          progress: Math.round((sentCount / contacts.length) * 100),
          sent: sentCount,
          total: contacts.length
        });
        
      } catch (err) {
        console.error("Failed sending to", contacts[i].email);
      }
    }

    campaign.status = "COMPLETED";
    campaign.stats.totalSent = contacts.length;
    campaign.stats.delivered = sentCount;
    await campaign.save();

    io.emit(`campaignStatus:${campaign._id}`, { status: "COMPLETED", progress: 100 });

  } catch (err) {
    console.error("Campaign Send Error:", err);
    res.status(500).json({ error: "Failed to dispatch campaign" });
  }
});

router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

export default router;
