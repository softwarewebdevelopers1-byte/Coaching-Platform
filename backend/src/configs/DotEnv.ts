import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
let ServerPort = process.env.DEV_PORT || 8000;
let MongoLocalUri = process.env.MONGO_LOCAL_URI;
let BrevoApiKey = process.env.BREVO_API_KEY;
let SupabaseUrl = process.env.SUPABASE_URL;
let SupabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
let SupabaseBucket = process.env.SUPABASE_BUCKET || "coach-photos";
if (!MongoLocalUri || !BrevoApiKey || !SupabaseUrl || !SupabaseServiceRoleKey) {
  console.error(
    "One or more required environment variables are not defined-->",
    { MongoLocalUri, BrevoApiKey, SupabaseUrl, SupabaseServiceRoleKey },
  );
  process.exit(1);
}
const DotEnvConfig = {
  ServerPort,
  BrevoApiKey,
  MongoLocalUri,
  SupabaseUrl,
  SupabaseServiceRoleKey,
  SupabaseBucket,
  GroqApiKey: process.env.GROQ_API_KEY,
};
export default DotEnvConfig;
