import { Router } from "express";
import { ContactSubmissionModel } from "../models/Contact.model.js";

const router = Router();

router.post("/", async (req, res): Promise<void> => {
  const { name, email, phone, interest, goals, source } = req.body;

  if (!name || !email || !phone || !interest || !goals) {
    res.status(400).json({
      message: "Name, email, phone, interest, and goals are required",
    });
    return;
  }

  const submission = await ContactSubmissionModel.create({
    name,
    email,
    phone,
    interest,
    goals,
    source,
  });

  res.status(201).json({
    message: "Contact submission received",
    submission,
  });
});

router.get("/", async (_req, res): Promise<void> => {
  const submissions = await ContactSubmissionModel.find().sort({ createdAt: -1 });
  res.status(200).json({ submissions });
});

export default router;
