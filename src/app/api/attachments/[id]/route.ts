import { getSession } from "@/app/server/auth/session";
import { getAttachmentObject, readS3Config } from "@/app/server/storage";
import { connectDatabase, db } from "@/prisma/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDatabase();

  const attachment = await db.orm.public.Attachment
    .select(
      "id",
      "filename",
      "contentType",
      "size",
      "data",
      "storageKey",
    )
    .include("ticket", (ticket) => ticket.select("authorId"))
    .where({ id })
    .first();

  if (!attachment || !attachment.ticket) {
    return new Response("Not found", { status: 404 });
  }

  if (
    session.user.role === "customer" &&
    attachment.ticket.authorId !== session.user.id
  ) {
    return new Response("Not found", { status: 404 });
  }

  let bytes: Uint8Array;

  if (attachment.storageKey) {
    const s3 = readS3Config();
    if (!s3) {
      console.error(
        "[storage] attachment has a storage key but S3 is not configured",
      );
      return new Response("Storage unavailable", { status: 500 });
    }

    try {
      const object = await getAttachmentObject(s3, attachment.storageKey);
      bytes = object.bytes;
    } catch (error) {
      console.error("[storage] attachment download failed", error);
      return new Response("Not found", { status: 404 });
    }
  } else if (attachment.data) {
    bytes = new Uint8Array(attachment.data);
  } else {
    return new Response("Not found", { status: 404 });
  }

  const safeFilename = attachment.filename.replace(/["\r\n]/g, "_");
  const encodedFilename = encodeURIComponent(attachment.filename);
  const body = new Blob([bytes.slice().buffer], {
    type: attachment.contentType,
  });

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      "Content-Length": String(bytes.byteLength),
      "Content-Type": attachment.contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
