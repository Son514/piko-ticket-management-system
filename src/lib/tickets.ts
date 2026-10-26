export const TICKET_CATEGORIES = [
  "general",
  "account",
  "billing",
  "technical",
  "feature",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  general: "General",
  account: "Account",
  billing: "Billing",
  technical: "Technical",
  feature: "Feature request",
};

export const TICKET_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
] as const;

export const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain";

export type AttachmentLike = {
  name: string;
  type: string;
  size: number;
};

/**
 * Multipart parsing can append parameters such as `;charset=utf-8` to the
 * content type. Compare and store the base media type only.
 */
export function normalizeAttachmentType(type: string): string {
  return type.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function validateAttachmentFile(
  file: AttachmentLike,
): string | undefined {
  if (file.size <= 0) return undefined;

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Attachment must be 5 MB or smaller.";
  }

  const type = normalizeAttachmentType(file.type);
  if (
    !ALLOWED_ATTACHMENT_TYPES.includes(
      type as (typeof ALLOWED_ATTACHMENT_TYPES)[number],
    )
  ) {
    return "Attachment must be a PDF, PNG, JPG, WEBP, or TXT file.";
  }

  if (file.name.length > 255) {
    return "Attachment filename is too long.";
  }

  return undefined;
}
