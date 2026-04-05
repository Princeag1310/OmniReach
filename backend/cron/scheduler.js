import cron from 'node-cron';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import { sendEmail } from '../utils/awsSes.js';

// Setup background worker that checks every minute for scheduled campaigns
export const initScheduler = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find campaigns marked as SCHEDULED where the schedule time has passed
      const dueCampaigns = await Campaign.find({
        status: "SCHEDULED",
        scheduledAt: { $lte: now }
      });

      for (let campaign of dueCampaigns) {
        campaign.status = "SENDING";
        await campaign.save();

        io.emit(`campaignStatus:${campaign._id}`, { status: "SENDING", progress: 0 });

        // Retrieve contacts
        let query = { userId: campaign.userId, unsubscribed: false };
        if (campaign.targetContacts && campaign.targetContacts.length > 0) {
          query._id = { $in: campaign.targetContacts };
        } else if (campaign.targetTags && campaign.targetTags.length > 0) {
          query.tags = { $in: campaign.targetTags };
        }

        const contacts = await Contact.find(query);

        if (contacts.length === 0) {
          campaign.status = "FAILED";
          await campaign.save();
          continue;
        }

        let sentCount = 0;
        for (let i = 0; i < contacts.length; i++) {
          try {
            const c = contacts[i];
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Personalize and Unsubscribe insertion
            const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
            const unsubLink = `${backendUrl}/api/contacts/unsubscribe/${c._id}`;
            let personalizedContent = campaign.content.replace(/{{firstName}}/g, c.firstName || "Friend");
            personalizedContent += `<br/><br/><p style="font-size: 11px; color: #888;">To stop receiving these emails, <a href="${unsubLink}">click here to unsubscribe</a>.</p>`;

            await sendEmail(c.email, campaign.subject, personalizedContent, campaign.senderEmail);
            
            sentCount++;
            io.emit(`campaignStatus:${campaign._id}`, {
              status: "SENDING",
              progress: Math.round((sentCount / contacts.length) * 100),
              sent: sentCount,
              total: contacts.length
            });
          } catch (err) {
            console.error("Cron sending error to", contacts[i].email);
          }
        }

        campaign.status = "COMPLETED";
        campaign.stats.totalSent = contacts.length;
        campaign.stats.delivered = sentCount;
        await campaign.save();
        io.emit(`campaignStatus:${campaign._id}`, { status: "COMPLETED", progress: 100 });
      }
    } catch (err) {
      console.error("Scheduler Error:", err);
    }
  });
};
