import bcrypt from "bcrypt";
import mongoose from "mongoose";
import DotEnvConfig from "../configs/DotEnv.js";
import { UserAccountsModel } from "../models/users.model.js";

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
    programName: "individual-executive",
    photo: "/sarah-mitchell.jpg",
    bio: "Executive coach helping leaders strengthen voice, clarity, and values-led influence.",
    experience: 15,
    languages: ["English"],
    expertise: ["Executive presence", "Career transition", "Leadership identity"],
    availabilitySummary: "Tue and Thu mornings",
    maxWorkload: 10,
  },
  {
    fullName: "Marcus Chen",
    email: "marcus@apexcoaching.com",
    password: "Coach@123",
    phone: "+1 800 555 0103",
    role: "coach" as const,
    status: "active" as const,
    programName: "group-executive",
    photo: "/marcus-chen.jpg",
    bio: "Group coaching facilitator focused on trust, alignment, and executive team performance.",
    experience: 12,
    languages: ["English"],
    expertise: ["Leadership cohorts", "Team alignment", "Strategic communication"],
    availabilitySummary: "Wed afternoons",
    maxWorkload: 8,
  },
  {
    fullName: "Amina Wanjiru",
    email: "amina@unwantra.co",
    password: "Coach@123",
    phone: "+254 700 000 101",
    role: "coach" as const,
    status: "active" as const,
    programName: "individual-executive",
    photo: "/amina-wanjiru.jpg",
    bio: "Former people leader supporting executives and founders to lead with confidence and boundaries.",
    experience: 14,
    languages: ["English", "Kiswahili"],
    expertise: ["Executive presence", "Courageous conversations", "Values-led leadership"],
    availabilitySummary: "Mon and Thu mornings",
    maxWorkload: 10,
  },
  {
    fullName: "Zuri Okafor",
    email: "zuri@unwantra.co",
    password: "Coach@123",
    phone: "+234 800 000 202",
    role: "coach" as const,
    status: "active" as const,
    programName: "group-executive",
    photo: "/zuri-okafor.jpg",
    bio: "Leadership facilitator specializing in group coaching, team rituals, and cross-cultural collaboration.",
    experience: 12,
    languages: ["English", "Igbo"],
    expertise: ["Leadership cohorts", "Team trust", "Group facilitation"],
    availabilitySummary: "Wed and Fri afternoons",
    maxWorkload: 8,
  },
  {
    fullName: "Naledi Mokoena",
    email: "naledi@unwantra.co",
    password: "Coach@123",
    phone: "+27 71 000 0303",
    role: "coach" as const,
    status: "active" as const,
    programName: "individual-executive,group-executive",
    photo: "/naledi-mokoena.jpg",
    bio: "ICF-aligned coach helping senior leaders navigate transition, identity, and strategic communication.",
    experience: 16,
    languages: ["English", "Sesotho"],
    expertise: ["Leadership transition", "Confidence", "Team alignment"],
    availabilitySummary: "Mon and Fri afternoons",
    maxWorkload: 12,
  },
  {
    fullName: "Kwame Mensah",
    email: "kwame@unwantra.co",
    password: "Coach@123",
    phone: "+233 24 000 0404",
    role: "coach" as const,
    status: "active" as const,
    programName: "individual-executive,group-executive",
    photo: "/kwame-mensah.jpg",
    bio: "Executive coach and board advisor supporting leaders through influence, resilience, and organizational change.",
    experience: 18,
    languages: ["English", "Twi"],
    expertise: ["Board communication", "Change leadership", "Executive resilience"],
    availabilitySummary: "Tue afternoons and Sat mornings",
    maxWorkload: 12,
  },
];

async function seedDatabase(): Promise<void> {
  await mongoose.connect(DotEnvConfig.MongoLocalUri);

  for (const account of seedAccounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);
    await UserAccountsModel.findOneAndUpdate(
      { email: account.email },
      {
        ...account,
        password: hashedPassword,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    console.log(`Seeded ${account.role}: ${account.email}`);
  }

  console.log("\nDefault credentials:");
  console.log("  Admin - admin@apexcoaching.com / Admin@123");
  console.log("  Coaches - use any seeded coach email / Coach@123");

  await mongoose.disconnect();
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
