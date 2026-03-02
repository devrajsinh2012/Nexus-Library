// Author: devrajsinh2012 <djgohil2012@gmail.com>
import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set in your .env file.");
}

export const client = new MongoClient(MONGODB_URI);

let _db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (_db) return _db;
  await client.connect();
  _db = client.db(); // uses the database from the connection string
  console.log("[mongodb] Connected to MongoDB Atlas");
  return _db;
}

export function getDB(): Db {
  if (!_db) throw new Error("MongoDB not connected yet. Call connectDB() first.");
  return _db;
}
