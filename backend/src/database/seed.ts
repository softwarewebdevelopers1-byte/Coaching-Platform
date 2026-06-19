import bcrypt from "bcrypt";
import mongoose from "mongoose";
import DotEnvConfig from "../configs/DotEnv.js";
import { UserAccountsModel } from "../models/users,model.js";

const seedAccounts = [
  {
    fullName: "Platform Admin",
    email: "admin@apexcoaching.com",
    password: "Admin@123",
    phone: "+1 800 555 0101",
    role: "admin" as const,
    status: "active" as const,
  },
  {
    fullName: "Sarah Mitchell",
    email: "coach@apexcoaching.com",
    password: "Coach@123",
    phone: "+1 800 555 0102",
    role: "coach" as const,
    status: "active" as const,
    programName: "career",
  },
  {
    fullName: "Marcus Chen",
    email: "marcus@apexcoaching.com",
    password: "Coach@123",
    phone: "+1 800 555 0103",
    role: "coach" as const,
    status: "active" as const,
    programName: "business",
  },
];

async function seedDatabase(): Promise<void> {
  await mongoose.connect(DotEnvConfig.MongoLocalUri);

  for (const account of seedAccounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);
    await UserAccountsModel.findOneAndUpdate(
      { email: account.email },
      {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        role: account.role,
        status: account.status,
        programName: account.programName,
        password: hashedPassword,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`Seeded ${account.role}: ${account.email}`);
  }

  console.log("\nDefault credentials:");
  console.log("  Admin — admin@apexcoaching.com / Admin@123");
  console.log("  Coach — coach@apexcoaching.com / Coach@123 (Career Coaching)");
  console.log("  Coach — marcus@apexcoaching.com / Coach@123 (Business Coaching)");

  await mongoose.disconnect();
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
