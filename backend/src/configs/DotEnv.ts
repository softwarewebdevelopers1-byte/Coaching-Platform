import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
let ServerPort = process.env.DEV_PORT || 8000;
let MongoLocalUri = process.env.MONGO_LOCAL_URI;
let BrevoApiKey = process.env.BREVO_API_KEY;
if (!MongoLocalUri || !BrevoApiKey) {
  console.error(
    "One or more required environment variables are not defined-->",
    { MongoLocalUri, BrevoApiKey },
  );
  process.exit(1);
}
const DotEnvConfig = {
  ServerPort,
  BrevoApiKey,
  MongoLocalUri,
  GroqApiKey: process.env.GROQ_API_KEY,
};
export default DotEnvConfig;
