import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  content: { type: String, required: true }, // HTML content or simple text
  type: { type: String, enum: ["EMAIL", "SMS"], default: "EMAIL" },
  status: { type: String, enum: ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED", "FAILED"], default: "DRAFT" },
  scheduledAt: { type: Date },
  targetTags: [{ type: String }], // Send to contacts containing any of these tags
  targetContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }], // Or explicitly selected contacts
  stats: {
    totalSent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    complained: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
