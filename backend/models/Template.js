import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  subject: { type: String }, // Optional, helpful for quick use
  htmlContent: { type: String, required: true },
  designJson: { type: Object } // In case we use a Drag & Drop Editor (e.g., Unlayer / GrapeJS structure)
}, { timestamps: true });

export default mongoose.model("Template", templateSchema);
