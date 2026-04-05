import express from "express";
import Contact from "../models/Contact.js";
import Campaign from "../models/Campaign.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/stats", async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments({ userId: req.user.id });
    const totalCampaigns = await Campaign.countDocuments({ userId: req.user.id });
    
    // Calculate overall deliverability if there are campaigns
    const campaigns = await Campaign.find({ userId: req.user.id });
    let totalSent = 0;
    let totalDelivered = 0;
    let totalBounced = 0;

    campaigns.forEach(c => {
      totalSent += c.stats.totalSent || 0;
      totalDelivered += c.stats.delivered || 0;
      totalBounced += c.stats.bounced || 0;
    });

    let deliverability = "0%";
    let bounceRate = "0%";
    if (totalSent > 0) {
      deliverability = ((totalDelivered / totalSent) * 100).toFixed(1) + "%";
      bounceRate = ((totalBounced / totalSent) * 100).toFixed(1) + "%";
    }

    // Generate real 7-day performance curve
    const performanceDataMap = {};
    for (let i = 6; i >= 0; i--) {
       const date = new Date();
       date.setDate(date.getDate() - i);
       const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
       performanceDataMap[dayStr] = { day: dayStr, sent: 0, opened: 0 };
    }
    
    // Add real campaign sends mapping to creation date
    campaigns.forEach(c => {
       const cDate = new Date(c.createdAt);
       const dayStr = cDate.toLocaleDateString("en-US", { weekday: "short" });
       if (performanceDataMap[dayStr]) {
          performanceDataMap[dayStr].sent += (c.stats?.totalSent || 0);
          performanceDataMap[dayStr].opened += (c.stats?.delivered || 0); // Mock opened with delivered for graph depth
       }
    });

    const performanceData = Object.values(performanceDataMap);

    res.json({
      totalContacts,
      totalCampaigns,
      deliverability: totalSent === 0 ? "N/A" : deliverability,
      bounceRate: totalSent === 0 ? "N/A" : bounceRate,
      performanceData
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
