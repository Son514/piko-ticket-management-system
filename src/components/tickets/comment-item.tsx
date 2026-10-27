"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  deleteCommentAction,
  updateCommentAction,
} from "@/app/server/comment-actions";
import type { CommentSummary } from "@/app/server/comments";
import { initialAuthState, type AuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_VISIBILITY_LABELS,
} from "@/lib/comments";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/roles";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

export function CommentItem({
  comment,
  currentUserId,
}: {
  comment: CommentSummary;
  currentUserId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [pending, startTransition] = useTransition();
  const isOwn = comment.author.id === currentUserId;
  const isInternal = comment.visibility === "internal";

  const onEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("commentId", String(comment.id));
    formData.set("body", body);

    startTransition(async () => {
      const result = await updateCommentAction(initialAuthState, formData);
      setState(result);
      if (result.success) setEditing(false);
    });
  };

  const onDelete = () => {
    if (!window.confirm("Delete this comment?")) return;

    const formData = new FormData();
    formData.set("commentId", String(comment.id));

    startTransition(async () => {
      const result = await deleteCommentAction(initialAuthState, formData);
      setState(result);
    });
  };

  return (
    <li
      className={cn(
        "rounded-lg border p-4",
        isInternal
          ? "border-amber-500/30 bg-amber-500/5"
          : "bg-card",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">
          {comment.author.name ?? comment.author.email}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {ROLE_LABELS[comment.author.role]}
        </span>
        {isInternal ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            {COMMENT_VISIBILITY_LABELS.internal}
          </span>
        ) : null}
        <time
          dateTime={comment.createdAt}
          className="ml-auto text-xs text-muted-foreground"
        >
          {formatDate(comment.createdAt)}
          {comment.editedAt ? " · edited" : ""}
        </time>
      </div>

      {editing ? (
        <form onSubmit={onEdit} className="mt-3 flex flex-col gap-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={COMMENT_BODY_MAX_LENGTH}
            disabled={pending}
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setBody(comment.body);
                setEditing(false);
                setState(initialAuthState);
              }}
            >
              Cancel
            </Button>
          </div>
          {state.error ? <FieldError>{state.error}</FieldError> : null}
        </form>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
          {comment.body}
        </p>
      )}

      {isOwn && !editing ? (
        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => {
              setBody(comment.body);
              setState(initialAuthState);
              setEditing(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            disabled={pending}
            onClick={onDelete}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ) : null}

      {state.error && !editing ? (
        <FieldError>{state.error}</FieldError>
      ) : null}
    </li>
  );
}
