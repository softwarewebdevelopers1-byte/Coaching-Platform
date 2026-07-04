import { randomBytes } from "crypto";

export const generateJitsiMeetingLink = (prefix = "unwantra-session") => {
  const safePrefix = String(prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "unwantra-session";
  const roomId = `${safePrefix}-${randomBytes(3).toString("hex")}`;

  return `https://meet.jit.si/${roomId}`;
};
