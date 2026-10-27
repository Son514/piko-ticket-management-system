"use client";

import { useState, useTransition, type FormEvent } from "react";

import { addCommentAction } from "@/app/server/comment-actions";
import { initialAuthState, type AuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_VISIBILITIES,
  COMMENT_VISIBILITY_LABELS,
  type CommentVisibility,
} from "@/lib/comments";

export function CommentForm({
  ticketId,
  canInternal,
}: {
  ticketId: number;
  canInternal: boolean;
}) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<CommentVisibility>("public");
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await addCommentAction(initialAuthState, formData);
      setState(result);
      if (result.success) {
        setBody("");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      {!canInternal ? <input type="hidden" name="visibility" value="public" /> : null}

      <div>
        <label htmlFor="comment-body" className="mb-1 block text-sm font-medium">
          {visibility === "internal" ? "Internal note" : "Reply"}
        </label>
        <Textarea
          id="comment-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            visibility === "internal"
              ? "Add a note only agents and admins can see."
              : "Write a reply to this ticket."
          }
          maxLength={COMMENT_BODY_MAX_LENGTH}
          disabled={pending}
          required
        />
      </div>

      {canInternal ? (
        <div>
          <label
            htmlFor="comment-visibility"
            className="mb-1 block text-sm font-medium"
          >
            Visibility
          </label>
          <select
            id="comment-visibility"
            name="visibility"
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CommentVisibility)
            }
            disabled={pending}
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {COMMENT_VISIBILITIES.map((option) => (
              <option key={option} value={option}>
                {COMMENT_VISIBILITY_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {body.length}/{COMMENT_BODY_MAX_LENGTH}
        </p>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Posting..."
            : visibility === "internal"
              ? "Add internal note"
              : "Add reply"}
        </Button>
      </div>

      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
