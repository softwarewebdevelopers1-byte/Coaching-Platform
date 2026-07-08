import crypto from "crypto";
import bcrypt from "bcrypt";
import { Router } from "express";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { CoachInviteModel, UserAccountsModel } from "../models/users.model.js";
import { sendResetPasswordEmail } from "../services/Brevo.emailSender.js";
import DotEnvConfig from "../configs/DotEnv.js";

const router = Router();

router.post("/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  const account = await UserAccountsModel.findOne({ email });

  if (!account) {
    res.status(401).json({
      message: "Invalid email or password.",
    });
    return;
  }

  if (account.role === "user") {
    res.status(403).json({
      message: "Users cannot login. Please contact support if you need assistance.",
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
      message: "Invalid email or password.",
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
      role: account.role,
      status: account.status,
      programName: account.programName,
      bio: account.bio,
      experience: account.experience,
      languages: account.languages,
      expertise: account.expertise,
      photo: account.photo,
      availabilitySummary: account.availabilitySummary,
      availabilityType: account.availabilityType,
      availableDays: account.availableDays,
      currentWorkload: account.currentWorkload,
      maxWorkload: account.maxWorkload,
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

router.get("/", async (req, res): Promise<void> => {
  const filter: Record<string, string> = {};
  if (req.query.role) {
    filter.role = String(req.query.role);
  }
  if (req.query.status) {
    filter.status = String(req.query.status);
  }
  if (req.query.programName) {
    filter.programName = String(req.query.programName);
  }

  const accounts = await UserAccountsModel.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });
  res.status(200).json({ accounts });
});

router.post("/", async (req, res): Promise<void> => {
  const {
    fullName,
    email,
    phone,
    role,
    status,
    programName,
    password,
    bio,
    experience,
    languages,
    expertise,
    photo,
    availabilitySummary,
    maxWorkload,
  } = req.body;

  if (!fullName || !email || !role) {
    res.status(400).json({ message: "Full name, email, and role are required" });
    return;
  }

  const existingAccount = await UserAccountsModel.findOne({ email });

  if (!existingAccount && role !== "user" && !password) {
    res.status(400).json({ message: "Password is required for coach and admin accounts" });
    return;
  }

  const update: Record<string, unknown> = {
    fullName,
    email,
    phone,
    role,
    status: status || "active",
    programName,
    bio,
    experience,
    languages,
    expertise,
    photo,
    availabilitySummary,
    maxWorkload,
  };

  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  const account = await UserAccountsModel.findOneAndUpdate({ email }, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).select("-password");

  res.status(201).json({ message: "Account saved", account });
});

router.put("/:id", async (req, res): Promise<void> => {
  const {
    fullName,
    email,
    phone,
    role,
    status,
    programName,
    password,
    bio,
    experience,
    languages,
    expertise,
    photo,
    availabilitySummary,
    availabilityType,
    availableDays,
    maxWorkload,
  } = req.body;
  const update: Record<string, unknown> = {};

  if (fullName !== undefined) update.fullName = fullName;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (role !== undefined) update.role = role;
  if (status !== undefined) update.status = status;
  if (programName !== undefined) update.programName = programName;
  if (bio !== undefined) update.bio = bio;
  if (experience !== undefined) update.experience = experience;
  if (languages !== undefined) update.languages = languages;
  if (expertise !== undefined) update.expertise = expertise;
  if (photo !== undefined) update.photo = photo;
  if (availabilitySummary !== undefined) update.availabilitySummary = availabilitySummary;
  if (availabilityType !== undefined) update.availabilityType = availabilityType;
  if (availableDays !== undefined) update.availableDays = availableDays;
  if (maxWorkload !== undefined) update.maxWorkload = maxWorkload;

  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }

  if (email) {
    const existingAccount = await UserAccountsModel.findOne({
      email,
      _id: { $ne: req.params.id },
    });
    if (existingAccount) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }
  }

  const account = await UserAccountsModel.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true },
  ).select("-password");

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
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const inviteBaseUrl = baseUrl || "http://localhost:5173";

  res.status(201).json({
    message: "Coach invite created",
    invite,
    link: `${inviteBaseUrl}/signup?token=${token}`,
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

  const {
    fullName,
    phone,
    programName,
    password,
    bio,
    experience,
    languages,
    expertise,
    photo,
    availabilitySummary,
    maxWorkload,
    availabilityType,
    availableDays,
  } = req.body;
  if (!fullName) {
    res.status(400).json({ message: "Full name is required" });
    return;
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  
  const derivedAvailabilitySummary = availabilitySummary || (
    availabilityType === "whole_week" 
      ? "Whole week" 
      : (availableDays && availableDays.length > 0 ? availableDays.join(", ") : "By discovery call")
  );

  const account = await UserAccountsModel.findOneAndUpdate(
    { email: invite.email },
    {
      fullName,
      email: invite.email,
      phone,
      programName,
      bio,
      experience,
      languages,
      expertise,
      photo,
      availabilitySummary: derivedAvailabilitySummary,
      maxWorkload,
      password: hashedPassword,
      role: "coach",
      status: "active",
      availabilityType: availabilityType || "whole_week",
      availableDays: availableDays || [],
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  invite.used = true;
  await invite.save();

  res.status(201).json({ message: "Coach account created", account });
});

router.post("/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const account = await UserAccountsModel.findOne({ email });
  if (account) {
    const token = crypto.randomBytes(24).toString("hex");
    (account as { resetPasswordToken?: string; resetPasswordExpires?: Date }).resetPasswordToken = token;
    (account as { resetPasswordToken?: string; resetPasswordExpires?: Date }).resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await account.save();

    const baseUrl = req.body.baseUrl || "http://localhost:5173";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    sendResetPasswordEmail({
      email: account.email,
      fullName: account.fullName,
      resetLink,
    }).catch((err) => {
      console.error("Error sending reset password email:", err);
    });
  }

  res.status(200).json({
    message: "If the account exists, a reset link has been sent to the email.",
  });
});

router.post("/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ message: "Token and password are required" });
    return;
  }

  const account = await UserAccountsModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!account) {
    res.status(400).json({ message: "Reset token is invalid or has expired." });
    return;
  }

  account.password = await bcrypt.hash(password, 10);
  delete (account as { resetPasswordToken?: string }).resetPasswordToken;
  delete (account as { resetPasswordExpires?: Date }).resetPasswordExpires;
  await account.save();

  res.status(200).json({ message: "Password has been reset successfully." });
});

router.post("/upload", async (req, res): Promise<void> => {
  const { photoData, originalName } = req.body;
  if (!photoData || !originalName) {
    res.status(400).json({ message: "Photo data and original name are required." });
    return;
  }

  if (!DotEnvConfig.SupabaseUrl || !DotEnvConfig.SupabaseServiceRoleKey) {
    console.error("Supabase environment variables are not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    res.status(500).json({ message: "Image storage is not configured. Contact an administrator." });
    return;
  }

  try {
    const supabaseUrl = DotEnvConfig.SupabaseUrl.startsWith("http")
      ? DotEnvConfig.SupabaseUrl
      : `https://${DotEnvConfig.SupabaseUrl}`;
    const supabaseClient = createClient(supabaseUrl, DotEnvConfig.SupabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const ext = path.extname(originalName) || ".jpg";
    const safeExt = ext.toLowerCase().match(/^\.([a-z0-9]+)$/)?.[0] || ".jpg";
    const filename = `coach_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    const mimeMatch = /^data:(image\/[^;]+);base64,/.exec(photoData);
    const contentType = mimeMatch?.[1] ?? "image/jpeg";
    const base64Image = photoData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");
    const bucketName = "coach-photos";
    const objectPath = `uploads/${filename}`;

    const { error } = await supabaseClient.storage
      .from(bucketName)
      .upload(objectPath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      res.status(500).json({ message: "An error occurred during file upload." });
      return;
    }

    const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl(objectPath);
    res.status(200).json({ photoUrl: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "An error occurred during file upload." });
  }
});


export default router;
