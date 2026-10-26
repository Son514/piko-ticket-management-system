import "server-only";

import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type S3Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

export function readS3Config(
  env: Record<string, string | undefined> = process.env,
): S3Config | null {
  const endpoint = env.S3_ENDPOINT?.trim();
  const bucket = env.S3_BUCKET?.trim();
  const accessKeyId = env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region: env.S3_REGION?.trim() || "auto",
  };
}

let cachedClient: { fingerprint: string; client: S3Client } | undefined;

function getS3Client(config: S3Config): S3Client {
  const fingerprint = [
    config.endpoint,
    config.bucket,
    config.accessKeyId,
    config.region,
  ].join("|");

  if (cachedClient?.fingerprint !== fingerprint) {
    cachedClient = {
      fingerprint,
      client: new S3Client({
        endpoint: config.endpoint,
        region: config.region,
        forcePathStyle: true,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      }),
    };
  }

  return cachedClient.client;
}

export function buildAttachmentKey(filename: string): string {
  const safeFilename =
    filename
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120) || "attachment";

  return `attachments/${randomUUID()}/${safeFilename}`;
}

export async function putAttachmentObject(
  config: S3Config,
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  await getS3Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: body.byteLength,
    }),
  );
}

export async function getAttachmentObject(
  config: S3Config,
  key: string,
): Promise<{ bytes: Uint8Array; contentType: string | undefined }> {
  const result = await getS3Client(config).send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );

  const bytes = await result.Body?.transformToByteArray();
  if (!bytes) {
    throw new Error("Attachment object has no body");
  }

  return {
    bytes,
    contentType: result.ContentType,
  };
}

export async function deleteAttachmentObject(
  config: S3Config,
  key: string,
): Promise<void> {
  try {
    await getS3Client(config).send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("[storage] failed to delete object", key, error);
  }
}
