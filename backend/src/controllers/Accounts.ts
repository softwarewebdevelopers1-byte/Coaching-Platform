import crypto from "crypto";
import { Router } from "express";
import { CoachInviteModel, UserAccountsModel } from "../models/users,model.js";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const accounts = await UserAccountsModel.find().sort({ createdAt: -1 });
  res.status(200).json({ accounts });
});

router.post("/", async (req, res): Promise<void> => {
  const { fullName, email, phone, role, status, programName } = req.body;

  if (!fullName || !email || !role) {
    res.status(400).json({ message: "Full name, email, and role are required" });
    return;
  }

  const account = await UserAccountsModel.findOneAndUpdate(
    { email },
    {
      fullName,
      email,
      phone,
      role,
      status: status || "active",
      programName,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ message: "Account saved", account });
});

router.put("/:id", async (req, res): Promise<void> => {
  const account = await UserAccountsModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  if (!account) {
    res.status(404).json({ message: "Account not found" });
    return;
  }

  res.status(200).json({ message: "Account updated", account });
});

router.delete("/:id", async (req, res): Promise<void> => {
  const account = await UserAccountsModel.findByIdAndDelete(req.params.id);

  if (!account) {
    res.status(404).json({ message: "Account not found" });
    return;
  }

  res.status(200).json({ message: "Account deleted" });
});

router.post("/coach-invites", async (req, res): Promise<void> => {
  const { email, createdBy, baseUrl } = req.body;

  if (!email) {
    res.status(400).json({ message: "Coach email is required" });
    return;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const invite = await CoachInviteModel.create({
    token,
    email,
    createdBy,
    used: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const inviteBaseUrl = baseUrl || "http://localhost:5173";

  res.status(201).json({
    message: "Coach invite created",
    invite,
    link: `${inviteBaseUrl}/?coachInvite=${token}`,
  });
});

router.get("/coach-invites/:token", async (req, res): Promise<void> => {
  const invite = await CoachInviteModel.findOne({ token: req.params.token });

  if (!invite || invite.used || invite.expiresAt < new Date()) {
    res.status(404).json({ message: "Invite link is invalid or expired" });
    return;
  }

  res.status(200).json({ invite });
});

router.post("/coach-invites/:token/register", async (req, res): Promise<void> => {
  const invite = await CoachInviteModel.findOne({ token: req.params.token });

  if (!invite || invite.used || invite.expiresAt < new Date()) {
    res.status(404).json({ message: "Invite link is invalid or expired" });
    return;
  }

  const { fullName, phone, programName } = req.body;
  if (!fullName) {
    res.status(400).json({ message: "Full name is required" });
    return;
  }

  const account = await UserAccountsModel.findOneAndUpdate(
    { email: invite.email },
    {
      fullName,
      email: invite.email,
      phone,
      programName,
      role: "coach",
      status: "active",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  invite.used = true;
  await invite.save();

  res.status(201).json({ message: "Coach account created", account });
});

export default router;
