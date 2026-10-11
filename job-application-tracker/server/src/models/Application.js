import mongoose from "mongoose";

const statuses = ["Applied", "Interview", "Offer", "Rejected", "Wishlist"];
const employmentTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: statuses, default: "Applied" },
    appliedDate: { type: Date, default: Date.now },
    deadline: { type: Date, default: null },
    jobUrl: { type: String, trim: true, default: "", maxlength: 500 },
    location: { type: String, trim: true, default: "", maxlength: 120 },
    employmentType: { type: String, enum: employmentTypes, default: "Full-time" },
    notes: { type: String, trim: true, default: "", maxlength: 3000 },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, createdAt: -1 });
export { statuses, employmentTypes };
export default mongoose.model("Application", applicationSchema);
