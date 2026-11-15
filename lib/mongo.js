import { MongoClient } from "mongodb";

const g = globalThis;
export async function mongo() {
  if (!g._mongo) {
    g._mongo = new MongoClient(process.env.MONGO_URI || "mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 2500 })
      .connect()
      .catch((e) => { g._mongo = null; throw e; }); // forget the failure so it retries once MongoDB is running
  }
  const client = await g._mongo;
  return client.db(process.env.MONGO_DB || "eventra");
}

// Append-only activity feed (best effort: never breaks the main request)
export async function logActivity(user, action, eventId) {
  try {
    const d = await mongo();
    await d.collection("activity").insertOne({ userId: user.id, userName: user.name, action, eventId, at: new Date() });
  } catch (e) {
    console.error("activity log failed:", e.message);
  }
}