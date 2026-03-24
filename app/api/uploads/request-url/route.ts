import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const storage = new Storage();

export async function POST(request: Request) {
  try {
    const { name, contentType } = await request.json();

    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: "GCS_BUCKET_NAME is not configured" },
        { status: 503 },
      );
    }

    const objectPath = `uploads/${randomUUID()}-${name || "file"}`;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectPath);

    const [uploadURL] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: contentType || "application/octet-stream",
    });

    return NextResponse.json({
      uploadURL,
      objectPath,
      metadata: {
        name: name || null,
        contentType: contentType || "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}

