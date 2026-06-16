import { Router } from "express";

const router = Router();

router.post("/book-slot", (req, res) => {
  // Logic to book a slot goes here
  res.send("Slot booked successfully!");
});
export default router;