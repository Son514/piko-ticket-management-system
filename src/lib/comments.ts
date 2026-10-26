export const COMMENT_VISIBILITIES = ["public", "internal"] as const;

export type CommentVisibility = (typeof COMMENT_VISIBILITIES)[number];

export const COMMENT_VISIBILITY_LABELS: Record<CommentVisibility, string> = {
  public: "Public reply",
  internal: "Internal note",
};

export const COMMENT_BODY_MAX_LENGTH = 5000;
