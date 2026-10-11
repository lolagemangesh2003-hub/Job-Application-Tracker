import { Router } from "express";
import mongoose from "mongoose";
import Application, { statuses, employmentTypes } from "../models/Application.js";
import requireAuth from "../middleware/requireAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

function cleanPayload(body) {
  const payload = {};
  const stringFields = ["company", "role", "jobUrl", "location", "notes"];
  for (const field of stringFields) {
    if (body[field] !== undefined) payload[field] = String(body[field]).trim();
  }
  if (body.status !== undefined) payload.status = body.status;
  if (body.employmentType !== undefined) payload.employmentType = body.employmentType;
  for (const field of ["appliedDate", "deadline"]) {
    if (body[field] !== undefined) {
      payload[field] = body[field] === "" || body[field] === null ? null : new Date(body[field]);
      if (payload[field] && Number.isNaN(payload[field].getTime())) {
        const error = new Error(`Invalid ${field}.`);
        error.status = 400;
        throw error;
      }
    }
  }
  if (payload.status && !statuses.includes(payload.status)) {
    const error = new Error("Invalid application status.");
    error.status = 400;
    throw error;
  }
  if (payload.employmentType && !employmentTypes.includes(payload.employmentType)) {
    const error = new Error("Invalid employment type.");
    error.status = 400;
    throw error;
  }
  if (payload.jobUrl && !/^https?:\/\/.+/i.test(payload.jobUrl)) {
    const error = new Error("Job URL must start with http:// or https://.");
    error.status = 400;
    throw error;
  }
  return payload;
}

router.get("/", asyncHandler(async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
  const search = String(req.query.search || "").trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ company: regex }, { role: regex }, { notes: regex }, { location: regex }];
  }
  const applications = await Application.find(filter).sort({ updatedAt: -1 });
  res.json({ applications });
}));

router.get("/stats", asyncHandler(async (req, res) => {
  const grouped = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const stats = { total: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0, Wishlist: 0 };
  grouped.forEach(({ _id, count }) => { stats[_id] = count; stats.total += count; });
  res.json({ stats });
}));

router.post("/", asyncHandler(async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.company || !payload.role) {
    return res.status(400).json({ message: "Company and role are required." });
  }
  const application = await Application.create({ ...payload, user: req.userId });
  res.status(201).json({ application });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid application ID." });
  const payload = cleanPayload(req.body);
  if (payload.company === "") return res.status(400).json({ message: "Company is required." });
  if (payload.role === "") return res.status(400).json({ message: "Role is required." });
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: payload },
    { new: true, runValidators: true }
  );
  if (!application) return res.status(404).json({ message: "Application not found." });
  res.json({ application });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid application ID." });
  const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!application) return res.status(404).json({ message: "Application not found." });
  res.json({ message: "Application deleted." });
}));

export default router;
