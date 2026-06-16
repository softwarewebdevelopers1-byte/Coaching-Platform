import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
let ServerPort = process.env.DEV_PORT || 8000;
let MongoLocalUri = process.env.MONGO_LOCAL_URI;
if (!MongoLocalUri) {
  console.error(
    "MongoDB URI is not defined in the environment variables-->",
    MongoLocalUri,
  );
  process.exit(1);
}
const DotEnvConfig = {
  ServerPort,
  MongoLocalUri,
};
export default DotEnvConfig;
