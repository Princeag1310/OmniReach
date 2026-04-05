import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  tags: [{ type: String }],
  customFields: { type: Map, of: String },
  unsubscribed: { type: Boolean, default: false }
}, { timestamps: true });

// Ensures an email is unique only per user, allowing different users to add the same contact email
contactSchema.index({ userId: 1, email: 1 }, { unique: true });

export default mongoose.model("Contact", contactSchema);
