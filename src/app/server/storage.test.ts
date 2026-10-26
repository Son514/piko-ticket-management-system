import { describe, expect, it } from "vitest";

import { buildAttachmentKey, readS3Config } from "@/app/server/storage";

const env = {
  S3_ENDPOINT: "https://storage.example.com",
  S3_BUCKET: "piko-uploads",
  S3_ACCESS_KEY_ID: "key-id",
  S3_SECRET_ACCESS_KEY: "secret",
};

describe("readS3Config", () => {
  it("returns null when any required variable is missing", () => {
    expect(readS3Config({})).toBeNull();
    expect(readS3Config({ ...env, S3_BUCKET: "" })).toBeNull();
    expect(readS3Config({ ...env, S3_SECRET_ACCESS_KEY: undefined })).toBeNull();
  });

  it("reads a complete config", () => {
    expect(readS3Config(env)).toEqual({
      endpoint: "https://storage.example.com",
      bucket: "piko-uploads",
      accessKeyId: "key-id",
      secretAccessKey: "secret",
      region: "auto",
    });
  });

  it("honors an explicit region", () => {
    expect(readS3Config({ ...env, S3_REGION: "eu-west-1" })?.region).toBe(
      "eu-west-1",
    );
  });
});

describe("buildAttachmentKey", () => {
  it("builds a namespaced, safe, unique key", () => {
    const first = buildAttachmentKey("my report?.pdf");
    const second = buildAttachmentKey("my report?.pdf");

    expect(first).toMatch(/^attachments\/[a-f0-9-]+\/my_report_\.pdf$/);
    expect(second).toMatch(/^attachments\/[a-f0-9-]+\/my_report_\.pdf$/);
    expect(first).not.toBe(second);
  });

  it("uses a fallback name for unsafe-only filenames", () => {
    expect(buildAttachmentKey("???")).toMatch(
      /^attachments\/[a-f0-9-]+\/attachment$/,
    );
  });
});
