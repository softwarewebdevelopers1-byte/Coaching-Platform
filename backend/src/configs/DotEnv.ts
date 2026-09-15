import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
let ServerPort = process.env.DEV_PORT || 8000;
let MongoLocalUri = process.env.MONGO_LOCAL_URI;
let BrevoApiKey = process.env.BREVO_API_KEY_2 || process.env.BREVO_API_KEY;
let BrevoSenderEmail =
  process.env.BREVO_SENDER_EMAIL || "cbetproject@gmail.com";
let BrevoSenderName = process.env.BREVO_SENDER_NAME || "UnWantraCoaching";
let SupabaseUrl = process.env.SUPABASE_URL;
let SupabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
let SupabaseBucket = process.env.SUPABASE_BUCKET || "coach-photos";
if (
  !MongoLocalUri ||
  !BrevoApiKey ||
  !BrevoSenderEmail ||
  !SupabaseUrl ||
  !SupabaseServiceRoleKey
) {
  console.error(
    "One or more required environment variables are not defined-->",
    {
      MongoLocalUri: Boolean(MongoLocalUri),
      BrevoApiKey: Boolean(BrevoApiKey),
      BrevoSenderEmail: Boolean(BrevoSenderEmail),
      SupabaseUrl: Boolean(SupabaseUrl),
      SupabaseServiceRoleKey: Boolean(SupabaseServiceRoleKey),
    },
  );
  process.exit(1);
}
const DotEnvConfig = {
  ServerPort,
  BrevoApiKey,
  BrevoSenderEmail,
  BrevoSenderName,
  MongoLocalUri,
  SupabaseUrl,
  SupabaseServiceRoleKey,
  SupabaseBucket,
  GroqApiKey: process.env.GROQ_API_KEY,
};
export default DotEnvConfig;
