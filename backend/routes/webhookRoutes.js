import express from "express";
import Contact from "../models/Contact.js";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// AWS SNS Webhooks send data as text/plain sometimes, but express.json works if parsed,
// we will parse JSON from req.body manually if needed.
router.post("/sns", express.json({ type: ['application/json', 'text/plain'] }), async (req, res) => {
  try {
    const snsType = req.headers["x-amz-sns-message-type"];
    
    if (snsType === "SubscriptionConfirmation") {
      const subscribeUrl = req.body.SubscribeURL;
      // In production, you would fetch(subscribeUrl) to verify the webhook destination
      console.log("SNS Subscription confirmed via:", subscribeUrl);
      return res.status(200).send("OK");
    }

    if (snsType === "Notification") {
      const message = JSON.parse(req.body.Message);
      const notificationType = message.notificationType;

      if (notificationType === "Bounce" || notificationType === "Complaint") {
        const bouncedEmails = message.bounce ? message.bounce.bouncedRecipients.map((r) => r.emailAddress) : [];
        const complainedEmails = message.complaint ? message.complaint.complainedRecipients.map((r) => r.emailAddress) : [];
        
        const allEmails = [...bouncedEmails, ...complainedEmails];
        
        for (const email of allEmails) {
          // Immediately unsubscribe the user globally
          await Contact.updateMany({ email }, { unsubscribed: true });
        }
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook parsing error", err);
    res.status(500).send("Error");
  }
});

export default router;
