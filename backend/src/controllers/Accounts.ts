import crypto from "crypto";
import bcrypt from "bcrypt";
import { Router } from "express";
import { CoachInviteModel, UserAccountsModel } from "../models/users,model.js";

const router = Router();

router.post("/login", async (req, res): Promise<void> => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({
      message: "Email, password, and role are required",
    });
    return;
  }

  if (role === "user") {
    res.status(403).json({
      message: "Users cannot login. Please contact support if you need assistance.",
    });
    return;
  }

  const account = await UserAccountsModel.findOne({ email, role });

  if (!account) {
    res.status(401).json({
      message: "Invalid email or role.",
    });
    return;
  }

  if (account.status === "disabled") {
    res.status(403).json({
      message: "Account is disabled.",
    });
    return;
  }

  if (!account.password) {
    res.status(401).json({
      message: "Account has no password set. Please use the invite link to register.",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, account.password);
  if (!passwordMatch) {
    res.status(401).json({
      message: "Invalid password.",
    });
    return;
  }

  res.status(200).json({
    message: "Login successful",
    account: {
      _id: account._id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      programName: account.programName,
      role: account.role,
      status: account.status,
    },
  });
});

router.post("/register", async (req, res): Promise<void> => {
  const { fullName, email, password, role, phone, programName } = req.body;

  if (!fullName || !email || !password || !role) {
    res.status(400).json({
      message: "Full name, email, password, and role are required",
    });
    return;
  }

  if (role === "user") {
    res.status(403).json({
      message: "Users cannot register. Please contact support.",
    });
    return;
  }

  const existingAccount = await UserAccountsModel.findOne({ email });
  if (existingAccount) {
    res.status(409).json({
      message: "Email already exists.",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const account = await UserAccountsModel.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role,
    programName,
    status: "active",
  });

  res.status(201).json({
    message: "Account created successfully",
    account: {
      _id: account._id,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
      status: account.status,
    },
  });
});

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

  const { fullName, phone, programName, password } = req.body;
  if (!fullName) {
    res.status(400).json({ message: "Full name is required" });
    return;
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const account = await UserAccountsModel.findOneAndUpdate(
    { email: invite.email },
    {
      fullName,
      email: invite.email,
      phone,
      programName,
      password: hashedPassword,
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
