"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";

import { createTicketAction } from "@/app/server/tickets-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthForm } from "@/lib/forms/use-auth-form";
import {
  ATTACHMENT_ACCEPT,
  TICKET_CATEGORIES,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
} from "@/lib/tickets";
import {
  createTicketSchema,
  validateAttachmentInput,
  type CreateTicketValues,
} from "@/lib/validation/tickets";

export function TicketForm() {
  const { form, state, onSubmit, pending } = useAuthForm<CreateTicketValues>(
    createTicketAction,
    {
      resolver: zodResolver(createTicketSchema),
      defaultValues: {
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        attachment: undefined,
      },
      mode: "onTouched",
    },
  );
  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {state.error ? <FieldError>{state.error}</FieldError> : null}

        <Field data-invalid={errors.title ? true : undefined}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            type="text"
            placeholder="Short summary of the issue"
            aria-invalid={errors.title ? true : undefined}
            {...form.register("title")}
          />
          {errors.title?.message ? (
            <FieldError>{errors.title.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={errors.description ? true : undefined}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="What happened? Include any details that will help the team."
            aria-invalid={errors.description ? true : undefined}
            {...form.register("description")}
          />
          {errors.description?.message ? (
            <FieldError>{errors.description.message}</FieldError>
          ) : null}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.category ? true : undefined}>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <select
              id="category"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:opacity-50"
              aria-invalid={errors.category ? true : undefined}
              {...form.register("category")}
            >
              {TICKET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {TICKET_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
            {errors.category?.message ? (
              <FieldError>{errors.category.message}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={errors.priority ? true : undefined}>
            <FieldLabel htmlFor="priority">Priority</FieldLabel>
            <select
              id="priority"
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:opacity-50"
              aria-invalid={errors.priority ? true : undefined}
              {...form.register("priority")}
            >
              {TICKET_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {TICKET_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
            {errors.priority?.message ? (
              <FieldError>{errors.priority.message}</FieldError>
            ) : null}
          </Field>
        </div>

        <Field data-invalid={errors.attachment ? true : undefined}>
          <FieldLabel htmlFor="attachment">Attachment</FieldLabel>
          <Input
            id="attachment"
            type="file"
            accept={ATTACHMENT_ACCEPT}
            aria-invalid={errors.attachment ? true : undefined}
            {...form.register("attachment", {
              validate: validateAttachmentInput,
            })}
          />
          <FieldDescription>
            Optional. PDF, PNG, JPG, WEBP, or TXT up to 5 MB.
          </FieldDescription>
          {typeof errors.attachment?.message === "string" ? (
            <FieldError>{errors.attachment.message}</FieldError>
          ) : null}
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating ticket..." : "Create ticket"}
          </Button>
          <Link
            href="/tickets"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}
